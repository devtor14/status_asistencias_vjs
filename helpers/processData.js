import { DEFAULT_SUMMARY } from '../constants/TEAM_CONFIG.js';
import { parseStages, consolidateTagsAndFilter, filterByLimitDate, countTeamsTasks } from './index.js';

const processData = (dataList, dateToEval) => {
  const stages = parseStages(dataList);

  stages.Asignado.content = consolidateTagsAndFilter(stages.Asignado.content);
  stages.Hecho.content = consolidateTagsAndFilter(stages.Hecho.content);
  stages['Por facturar'].content = consolidateTagsAndFilter(stages['Por facturar'].content);

  stages.Hecho.content = filterByLimitDate(stages.Hecho.content, dateToEval);
  stages['Por facturar'].content = filterByLimitDate(stages['Por facturar'].content, dateToEval);

  delete stages.Nuevo;
  delete stages.Cancelado;

  const summary = countTeamsTasks(stages.Asignado.content, DEFAULT_SUMMARY);

  return [stages, summary];
};

export { processData };
