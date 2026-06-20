// Habit Tracker - Widget de pantalla de BLOQUEO (círculo pequeño)
// Corre el script una vez (en la app, no como widget) para guardar tu
// email/contraseña en el Keychain de iOS.

const FIREBASE_API_KEY = "AIzaSyDDurs26X1L7TBcNRSgPUfmygZZhYtw91g";
const FIREBASE_PROJECT_ID = "habit-tracker-b6678";
const APP_URL = "https://habit-change.netlify.app";

async function getCredentials() {
  const emailKey = "habit_tracker_email";
  const passKey = "habit_tracker_password";

  if (Keychain.contains(emailKey) && Keychain.contains(passKey)) {
    return { email: Keychain.get(emailKey), password: Keychain.get(passKey) };
  }

  const alert = new Alert();
  alert.title = "Habit Tracker";
  alert.message = "Ingresa tu correo y contraseña (se guardan en el Keychain del dispositivo)";
  alert.addTextField("Correo");
  alert.addSecureTextField("Contraseña");
  alert.addAction("Guardar");
  await alert.present();

  const email = alert.textFieldValue(0);
  const password = alert.textFieldValue(1);
  Keychain.set(emailKey, email);
  Keychain.set(passKey, password);
  return { email, password };
}

async function signIn(email, password) {
  const req = new Request(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`
  );
  req.method = "POST";
  req.headers = { "Content-Type": "application/json" };
  req.body = JSON.stringify({ email, password, returnSecureToken: true });
  const res = await req.loadJSON();
  if (!res.idToken) throw new Error(res.error?.message ?? "No se pudo iniciar sesión");
  return { idToken: res.idToken, uid: res.localId };
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToKey(dateKey, days) {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
}

async function getAllCompletedDates(uid, idToken) {
  const req = new Request(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`
  );
  req.method = "POST";
  req.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${idToken}`,
  };
  req.body = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: "habit_logs" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            { fieldFilter: { field: { fieldPath: "userId" }, op: "EQUAL", value: { stringValue: uid } } },
            { fieldFilter: { field: { fieldPath: "completado" }, op: "EQUAL", value: { booleanValue: true } } },
          ],
        },
      },
    },
  });

  const res = await req.loadJSON();
  if (!Array.isArray(res)) return new Set();

  const dates = new Set();
  for (const item of res) {
    const fecha = item.document?.fields?.fecha?.stringValue;
    if (fecha) dates.add(fecha);
  }
  return dates;
}

function calculateCurrentStreakDays(completedDates) {
  const today = localDateKey(new Date());
  let cursor = completedDates.has(today) ? today : addDaysToKey(today, -1);
  let streak = 0;
  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

function streakDisplay(days) {
  if (days < 7) {
    return { value: days, unit: days === 1 ? "día" : "días" };
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return { value: weeks, unit: weeks === 1 ? "sem" : "sems" };
  }
  const months = Math.floor(days / 30);
  return { value: months, unit: months === 1 ? "mes" : "meses" };
}

async function createWidget() {
  const { email, password } = await getCredentials();
  const { idToken, uid } = await signIn(email, password);

  const completedDates = await getAllCompletedDates(uid, idToken);
  const streakDays = calculateCurrentStreakDays(completedDates);
  const { value, unit } = streakDisplay(streakDays);

  const widget = new ListWidget();
  widget.url = APP_URL;
  widget.setPadding(2, 2, 2, 2);

  const top = widget.addText("Racha");
  top.font = Font.systemFont(10);
  top.centerAlignText();
  top.minimumScaleFactor = 0.5;

  const numberText = widget.addText(String(value));
  numberText.font = Font.boldSystemFont(22);
  numberText.centerAlignText();
  numberText.minimumScaleFactor = 0.5;

  const bottom = widget.addText(unit);
  bottom.font = Font.systemFont(10);
  bottom.centerAlignText();
  bottom.minimumScaleFactor = 0.5;

  widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
  return widget;
}

const widget = await createWidget();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentAccessoryCircular();
}

Script.complete();
