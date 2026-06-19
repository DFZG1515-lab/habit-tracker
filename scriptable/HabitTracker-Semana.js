// Habit Tracker - Widget "Semana en puntos"
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

function dateKeyUTC(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=domingo
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

async function getWeekCompletedDates(uid, idToken, mondayKey) {
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
            { fieldFilter: { field: { fieldPath: "fecha" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: mondayKey } } },
          ],
        },
      },
    },
  });

  const res = await req.loadJSON();
  console.log("uid: " + uid);
  console.log("mondayKey: " + mondayKey);
  console.log("respuesta Firestore: " + JSON.stringify(res));

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

function createRingImage(completed, total) {
  const size = 110;
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const center = new Point(size / 2, size / 2);
  const radius = size / 2 - 9;
  const startAngle = -Math.PI / 2;
  const fullCircleEnd = startAngle + Math.PI * 2;
  const progressEnd = startAngle + Math.PI * 2 * (completed / total);

  drawArc(ctx, center, radius, startAngle, fullCircleEnd, new Color("#3f3f46"), 9);
  if (completed > 0) {
    drawArc(ctx, center, radius, startAngle, progressEnd, Color.white(), 9);
  }

  ctx.setTextColor(Color.white());
  ctx.setTextAlignedCenter();
  ctx.setFont(Font.boldSystemFont(26));
  ctx.drawTextInRect(
    `${completed}/${total}`,
    new Rect(0, size / 2 - 16, size, 32)
  );

  return ctx.getImage();
}

async function createWidget() {
  const { email, password } = await getCredentials();
  const { idToken, uid } = await signIn(email, password);

  const today = new Date();
  const monday = startOfWeekMonday(today);
  const mondayKey = dateKeyUTC(monday);
  const completedDates = await getWeekCompletedDates(uid, idToken, mondayKey);

  const widget = new ListWidget();
  widget.backgroundColor = new Color("#0a0a0a");
  widget.url = APP_URL;
  widget.setPadding(18, 12, 12, 12);

  const completedCount = [...completedDates].filter((d) => d >= mondayKey).length;

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

  const ringStack = widget.addStack();
  ringStack.layoutHorizontally();
  ringStack.addSpacer();
  const ringImage = ringStack.addImage(createRingImage(completedCount, 7));
  ringImage.imageSize = new Size(110, 110);
  ringStack.addSpacer();

  widget.addSpacer(8);

  const caption = widget.addText("ESTA SEMANA");
  caption.font = Font.semiboldSystemFont(9);
  caption.textColor = new Color("#9a9a9a");
  caption.centerAlignText();

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
