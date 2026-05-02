import { processData, formatSummary } from './helpers/index.js';

const excelInput = document.querySelector('#file-input');
const yesterdayInput = document.querySelector('#yesterday');
const yesterdayValue = document.querySelector('#yesterday-value');
const todayInput = document.querySelector('#today');
const todayValue = document.querySelector('#today-value');
const startButton = document.querySelector('#start-button');
const copyButton = document.querySelector('#copy-button');

const elements = {
  asignadas: document.querySelector('#asignadas'),
  progreso: document.querySelector('#progreso'),
  facturar: document.querySelector('#facturar'),
  atendidos: document.querySelector('#atendidos'),
  activas: document.querySelector('#activas'),
  inactivas: document.querySelector('#inactivas'),
  fileName: document.querySelector('#file-name'),
};

let formatedData = '';

window.addEventListener('load', () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatISO = (date) => date.toISOString().split('T')[0];
  const formatDay = (date) => String(date.getDate()).padStart(2, '0');

  todayInput.value = formatISO(today);
  yesterdayInput.value = formatISO(yesterday);
  todayValue.textContent = formatDay(today);
  yesterdayValue.textContent = formatDay(yesterday);

  document.body.style.opacity = '1';
});

excelInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) elements.fileName.textContent = file.name;
});

startButton.addEventListener('click', () => {
  const archivo = excelInput.files[0];
  const date = document.querySelector('input[type="radio"]:checked')?.value;

  if (!archivo) return alert('Debes cargar un archivo');

  const reader = new FileReader();
  reader.onload = (evento) => {
    const data = new Uint8Array(evento.target.result);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dataJSON = XLSX.utils.sheet_to_json(sheet);

    const [stages, sumary] = processData(dataJSON, date);
    formatedData = formatSummary(stages, sumary);

    showOnDashboard(formatedData);
    copyButton.disabled = false;
  };

  reader.readAsArrayBuffer(archivo);
});

copyButton.addEventListener('click', async () => {
  if (!formatedData?.report) return;

  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText(formatedData.report);
    alert('¡Datos copiados al portapapeles!');
  } catch (err) {
    console.error('Error al intentar copiar:', err);
    alert('Error al copiar');
  } finally {
    copyButton.disabled = false;
  }
});

function createContratistaItem(item) {
  const li = document.createElement('li');
  const firstSpan = document.createElement('span');
  firstSpan.textContent = item.label;
  li.appendChild(firstSpan);

  if (item.value) {
    const lastSpan = document.createElement('span');
    lastSpan.textContent = item.value;
    li.appendChild(lastSpan);
    if (item.description) li.title = item.description;
  }

  return li;
}

function showOnDashboard(data) {
  const { kpi, contratistas } = data.summary;

  Object.keys(kpi).forEach((key) => {
    if (elements[key]) elements[key].textContent = kpi[key];
  });

  elements.activas.innerHTML = '';
  elements.inactivas.innerHTML = '';

  const fragmentActivas = document.createDocumentFragment();
  const fragmentInactivas = document.createDocumentFragment();

  contratistas.forEach((item) => {
    const li = createContratistaItem(item);
    item.value ? fragmentActivas.appendChild(li) : fragmentInactivas.appendChild(li);
  });

  elements.activas.appendChild(fragmentActivas);
  elements.inactivas.appendChild(fragmentInactivas);
}
