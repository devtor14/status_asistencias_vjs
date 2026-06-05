import { processData, formatSummary, alertHandler } from './helpers/index.js';

const excelInput = document.querySelector('#file-input');
const yesterdayInput = document.querySelector('#yesterday');
const yesterdayValue = document.querySelector('#yesterday-value');
const todayInput = document.querySelector('#today');
const todayValue = document.querySelector('#today-value');
const startButton = document.querySelector('#start-button');
const modalButton = document.querySelector('#modal-button');
const textArea = document.querySelector('#text-area');
const copyButton = document.querySelector('#copy-button');
const closeButton = document.querySelector('#close-button');
const themeShifter = document.querySelector('#theme-shifter');

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

  document.querySelector('#APP').style.opacity = '1';
});

themeShifter.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  document.cookie != 'light' ? (document.cookie = 'light') : (document.cookie = 'dark');
});

excelInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) elements.fileName.textContent = file.name;
});

startButton.addEventListener('click', () => {
  const archivo = excelInput.files[0];
  const date = document.querySelector('input[type="radio"]:checked')?.value;

  if (!archivo) return alertHandler('Debes cargar un archivo de Asistencias válido.');

  const reader = new FileReader();

  reader.onload = (evento) => {
    try {
      const data = new Uint8Array(evento.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelJSON = XLSX.utils.sheet_to_json(sheet);
      const excelColumns = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

      const requireColumns = ['Título', 'Etapa', 'Personas asignadas', 'Etiquetas', 'Fecha límite'];
      const missingColumns = requireColumns.filter((item) => !excelColumns.includes(item));

      if (missingColumns.length > 0) {
        throw `Faltan las siguientes columnas en el archivo:\n\n ${missingColumns.join('\n ')}`;
      }

      const [stages, summary] = processData(excelJSON, date);
      formatedData = formatSummary(stages, summary);

      showOnDashboard(formatedData);
      modalButton.disabled = false;
      textArea.textContent = formatedData.report;

      console.group('DEPURACIÓN PARA DESARROLLADOR');
      console.log('RAW DATA', excelJSON);
      console.log('STAGES', stages);
      console.log('SUMMARY', summary);
    } catch (error) {
      alertHandler(error);
    }
  };

  reader.readAsArrayBuffer(archivo);
});

modalButton.addEventListener('click', () => {
  if (!formatedData?.report || modal.className == 'show') return;
  elements.modal.className = 'show';
  modalButton.disabled = true;
});

textArea.addEventListener(
  'input',
  (() => {
    let timeoutId;

    return (e) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (!e.target.value) return;
        formatedData.report = e.target.value;
      }, 500);
    };
  })(),
);

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(formatedData.report);
    alertHandler('Reporte copiado al Portapapeles.');
  } catch (err) {
    alertHandler('Hubo un error al intentar copiar el Reporte.');
  }
});

closeButton.addEventListener('click', () => {
  elements.modal.className = '';
  modalButton.disabled = false;
});

function createContratistaItem(item) {
  const li = document.createElement('li');
  const firstSpan = document.createElement('span');
  const div = document.createElement('div');

  firstSpan.textContent = item.label;
  div.textContent = item.value;
  li.appendChild(firstSpan);
  li.appendChild(div);

  console.log(item);

  if (item.value && item.description) li.title = item.description;

  if (item.value > 0) li.className = 'low-value';
  if (item.label == 'SMARTLIFE' || item.label == 'TERASERVICES PUERTO') return li;
  if (item.label == 'INVERSIONES PEÑALVA' || item.label == 'LFM CONSULTOR') {
    if (item.value > 5) li.className = 'mid-value';
    if (item.value >= 7) li.className = 'high-value';
    return li;
  }

  if (item.value >= 2) li.className = 'mid-value';
  if (item.value > 4) li.className = 'high-value';

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
