import { processData, formatSummary } from './helpers/index.js';

const excelInput = document.querySelector('#file-input');
const yesterdayInput = document.querySelector('#yesterday');
const yesterdayValue = document.querySelector('#yesterday-value');
const todayInput = document.querySelector('#today');
const todayValue = document.querySelector('#today-value');
const startButton = document.querySelector('#start-button');
const copyButton = document.querySelector('#copy-button');

const elements = {
  fileName: document.querySelector('#file-name'),
  asignadas: document.querySelector('#asignadas'),
  progreso: document.querySelector('#progreso'),
  facturar: document.querySelector('#facturar'),
  atendidos: document.querySelector('#atendidos'),
  teams: document.querySelector('#teams-list'),
  modal: document.querySelector('#modal'),
};

let formatedData = '';

window.addEventListener('load', () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatISO = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
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
  if (!formatedData?.report || modal.className == 'show') return;

  copyButton.disabled = true;
  modal.className = 'show';
  try {
    await navigator.clipboard.writeText(formatedData.report);
  } catch (err) {
    console.error('Error al intentar copiar:', err);
  }

  setTimeout(() => {
    modal.className = '';
    copyButton.disabled = false;
  }, 4000);
});

function createContratistaItem(item) {
  const li = document.createElement('li');
  const firstSpan = document.createElement('span');
  const div = document.createElement('div');

  firstSpan.textContent = item.label;
  div.textContent = item.value;
  li.appendChild(firstSpan);
  li.appendChild(div);

  if (item.value && item.description) li.title = item.description;
  if (item.value > 0) li.className = 'low-value';
  if (item.value > 4) li.className = 'mid-value';
  if (item.value > 7) li.className = 'high-value';

  return li;
}

function showOnDashboard(data) {
  const { kpi, contratistas } = data.summary;

  contratistas.sort((a, b) => b.value - a.value);

  Object.keys(kpi).forEach((key) => {
    if (elements[key]) elements[key].textContent = kpi[key];
  });

  elements.teams.innerHTML = '';

  const fragment = document.createDocumentFragment();

  contratistas.forEach((item) => {
    const li = createContratistaItem(item);
    fragment.appendChild(li);
  });

  elements.teams.appendChild(fragment);
}
