import { GLOBAL_CONFIG } from '../constants/TEAM_CONFIG.js';

const formatSummary = (stages, summary) => {
  const generalSummary = {
    kpi: {
      asignadas: stages.Asignado.amount,
      progreso: stages['En Progreso']?.amount || 0,
      facturar: stages['Por facturar']?.amount || 0,
      atendidos: stages['Por facturar'].content.length + stages.Hecho.content.length,
    },
    contratistas: [],
  };

  const generateTeamLine = (config) => {
    const data = summary[config.id];

    if (config.type === 'simple') {
      generalSummary.contratistas.push({ label: config.label, value: data || 0 });
      return `▪️ *${config.label}*: (${data || 0})`;
    }

    if (config.type === 'split') {
      generalSummary.contratistas.push({
        label: config.label,
        value: (data?.rf || 0) + (data?.ftth || 0),
        description: `(${data?.rf || 0})RF / (${data?.ftth || 0})FTTH`,
      });
      return `▪️ *${config.label}*: (${data?.rf || 0})RF / (${data?.ftth || 0})FTTH`;
    }

    if (config.id === 'SPECIAL_PE') {
      const aoc = summary['Ruben Dario Sanchez Avila'] || summary['Carlos Gabriel Alquedan Pineda'] || 0;
      const ftth = 0;

      generalSummary.contratistas.push({
        label: 'PE',
        value: aoc,
        description: `(${aoc})AOC / (0)FTTH`,
      });
      return `▪️ *PE*: (${aoc})AOC / (${ftth})FTTH`;
    }

    return '';
  };

  const teamsHtml = GLOBAL_CONFIG.map(generateTeamLine).join('\n');
  const report = `_*STATUS DE LAS ASISTENCIAS*_

▪️ _N° de Asistencias Asignadas:_ *${stages.Asignado.amount}*
▪️ _N° Tickets de Asistencias en espera:_ *VALIDAR*

${teamsHtml}

▪️ _Asistencias En Progreso:_ *${stages['En Progreso']?.amount || 0}*
▪️ _Asistencias Por Facturar:_ *${stages['Por facturar']?.amount || 0}*
▪️ _Clientes atendidos Hoy:_ *${stages['Por facturar'].content.length + stages.Hecho.content.length}*`;

  return { summary: generalSummary, report };
};

export { formatSummary };
