const parseStages = (dataList) => {
  const stages = {};
  let lastHeaderName = '';

  dataList.forEach((element) => {
    const match = /^(.+?)\s*\((\d+)\)$/i.exec(element[Object.keys(element)[0]]);

    if (match) {
      const [_, headerName, headerAmount] = match;
      const name = headerName.trim();

      lastHeaderName = name;
      stages[name] = { amount: headerAmount.trim(), content: [] };
    } else {
      delete element.Actividades;
      delete element.Calle;
      delete element.Estado;
      delete element.Prioridad;

      stages[lastHeaderName].content.push(element);
    }
  });

  return stages;
};

export { parseStages };
