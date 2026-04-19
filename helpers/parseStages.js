const parseStages = (dataList) => {
  const stages = {};
  let lastHeaderName = '';

  dataList.forEach((element) => {
    const match = /^(.+?)\s*\((\d+)\)$/i.exec(element.Etapa);

    if (match) {
      const [_, headerName, headerAmount] = match;
      const name = headerName.trim();

      lastHeaderName = name;
      stages[name] = { amount: headerAmount.trim(), content: [] };
    } else if (lastHeaderName) {
      stages[lastHeaderName].content.push(element);
    }
  });

  return stages;
};

export { parseStages };
