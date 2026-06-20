// Habit Tracker - Widget "Racha actual"
// Configura tu proyecto abajo y corre el script una vez para guardar tu
// email/contraseña en el Keychain de iOS (no se guardan en texto plano).

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

// Misma lógica que la app web: usar fecha LOCAL, no UTC, para que las rachas coincidan.
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

  if (!Array.isArray(res)) {
    const alert = new Alert();
    alert.title = "Error de Firestore";
    alert.message = JSON.stringify(res);
    alert.addAction("OK");
    await alert.present();
    return new Set();
  }

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
    return { value: weeks, unit: weeks === 1 ? "semana" : "semanas" };
  }
  const months = Math.floor(days / 30);
  return { value: months, unit: months === 1 ? "mes" : "meses" };
}

function drawArc(ctx, center, radius, startAngle, endAngle, color, lineWidth) {
  const path = new Path();
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps);
    const point = new Point(
      center.x + radius * Math.cos(angle),
      center.y + radius * Math.sin(angle)
    );
    if (i === 0) path.move(point);
    else path.addLine(point);
  }
  ctx.addPath(path);
  ctx.setStrokeColor(color);
  ctx.setLineWidth(lineWidth);
  ctx.strokePath();
}

function createMiniLogo() {
  const size = 30;
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const center = new Point(size / 2, size / 2);
  const radius = size / 2 - 6;
  const startAngle = -Math.PI / 2;
  const fullCircleEnd = startAngle + Math.PI * 2;
  const progressEnd = startAngle + Math.PI * 2 * 0.65;

  drawArc(ctx, center, radius, startAngle, fullCircleEnd, new Color("#3f3f46"), 3.5);
  drawArc(ctx, center, radius, startAngle, progressEnd, Color.white(), 3.5);

  return ctx.getImage();
}

async function createWidget() {
  const { email, password } = await getCredentials();
  const { idToken, uid } = await signIn(email, password);

  const completedDates = await getAllCompletedDates(uid, idToken);
  const streakDays = calculateCurrentStreakDays(completedDates);
  const { value, unit } = streakDisplay(streakDays);

  const widget = new ListWidget();
  widget.backgroundColor = new Color("#0a0a0a");
  widget.url = APP_URL;
  widget.setPadding(18, 12, 12, 12);

  const topRow = widget.addStack();
  topRow.layoutHorizontally();
  topRow.centerAlignContent();
  topRow.spacing = 4;

  const logoImage = topRow.addImage(createMiniLogo());
  logoImage.imageSize = new Size(14, 14);

  const nameStack = topRow.addStack();
  nameStack.layoutVertically();
  nameStack.spacing = 0;

  const nameTop = nameStack.addText("Habit");
  nameTop.font = Font.semiboldSystemFont(8);
  nameTop.textColor = Color.white();

  const nameBottom = nameStack.addText("Tracker");
  nameBottom.font = Font.semiboldSystemFont(8);
  nameBottom.textColor = Color.white();

  topRow.addSpacer();

  widget.addSpacer();

  const label = widget.addText("Racha actual");
  label.font = Font.semiboldSystemFont(11);
  label.textColor = new Color("#9a9a9a");
  label.centerAlignText();

  widget.addSpacer(4);

  const numberText = widget.addText(String(value));
  numberText.font = Font.boldSystemFont(44);
  numberText.textColor = Color.white();
  numberText.centerAlignText();

  const unitText = widget.addText(unit);
  unitText.font = Font.semiboldSystemFont(13);
  unitText.textColor = Color.white();
  unitText.centerAlignText();

  widget.addSpacer();

  widget.refreshAfterDate = new Date(Date.now() + 30 * 60 * 1000);
  return widget;
}

const widget = await createWidget();

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentSmall();
}

Script.complete();
