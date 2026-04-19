import { GLOBAL_CONFIG, DEFAULT_SUMMARY } from './constants/TEAM_CONFIG.js';
import { parseStages, consolidateTagsAndFilter, filterByLimitDate, countTeamsTasks } from './helpers/index.js';

const inputExcel = document.querySelector('#input-excel');
const inputDate = document.querySelector('#input-date');
const button = document.querySelector('#button');
const textArea = document.querySelector('#text-area');

button.addEventListener('click', (e) => {
  const archivo = inputExcel.files[0];
  const date = inputDate.value;

  if (!archivo || !date) {
    alert('Debes cargar un archivo y una fecha');
    return;
  }

  const reader = new FileReader();

  reader.onload = (evento) => {
    const data = new Uint8Array(evento.target.result);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dataJSON = XLSX.utils.sheet_to_json(sheet);
    processData(dataJSON, date);
  };

  reader.readAsArrayBuffer(archivo);
});

function processData(dataList, dateToEval) {
  const stages = parseStages(dataList);

  stages.Asignado.content = consolidateTagsAndFilter(stages.Asignado.content);
  stages.Hecho.content = consolidateTagsAndFilter(stages.Hecho.content);
  stages['Por facturar'].content = consolidateTagsAndFilter(stages['Por facturar'].content);

  stages.Hecho.content = filterByLimitDate(stages.Hecho.content, dateToEval);
  stages['Por facturar'].content = filterByLimitDate(stages['Por facturar'].content, dateToEval);

  delete stages.Nuevo;
  delete stages.Cancelado;

  const summary = countTeamsTasks(stages.Asignado.content, DEFAULT_SUMMARY);

  renderSummary(stages, summary);
}

function renderSummary(stages, summary) {
  const generateTeamLine = (config) => {
    const data = summary[config.id];

    if (config.type === 'simple') {
      return `▪️ *${config.label}*: (${data || 0})`;
    }

    if (config.type === 'split') {
      return `▪️ *${config.label}*: (${data?.rf || 0})RF / (${data?.ftth || 0})FTTH`;
    }

    if (config.id === 'SPECIAL_PE') {
      const aoc = summary['Ruben Dario Sanchez Avila'] || 0;
      const ftth = summary['Carlos Gabriel Alquedan Pineda'] || 0;
      return `▪️ *PE*: (${aoc})AOC / (${ftth})FTTH`;
    }

    return '';
  };

  const teamsHtml = GLOBAL_CONFIG.map(generateTeamLine).join('\n');

  textArea.textContent = `
_*STATUS DE LAS ASISTENCIAS*_

▪️ _N° de Asistencias Asignadas:_ *${stages.Asignado.amount}*
▪️ _N° Tickets de Asistencias en espera:_ *VALIDAR MANUALMENTE*

${teamsHtml}

▪️ _Asistencias En Progreso:_ *${stages['En Progreso']?.amount || 0}*
▪️ _Asistencias Por Facturar:_ *${stages['Por facturar']?.amount || 0}*
▪️ _Clientes atendidos Hoy:_ *${stages['Por facturar'].content.length + stages.Hecho.content.length}*
  `;

  document.body.insertAdjacentHTML('beforeend', fullTemplate);
}
