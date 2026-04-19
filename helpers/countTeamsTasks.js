const countTeamsTasks = (content, DEFAULT_SUMMARY) => {
  const summary = DEFAULT_SUMMARY();

  content.forEach((element) => {
    const name = element['Personas asignadas'].replace(/\(User\)/i, '').trim();
    const isRF = /\bRF\b/.test(element.Etiquetas);

    if (typeof summary[name] === 'object') {
      isRF ? summary[name].rf++ : summary[name].ftth++;
    } else {
      summary[name]++;
    }
  });

  return summary;
};

export { countTeamsTasks };
