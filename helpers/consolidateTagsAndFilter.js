const consolidateTagsAndFilter = (content) => {
  let lastValidIndex = null;

  return content.filter((element, index) => {
    if (Object.keys(element).length > 1) {
      if (!element['Personas asignadas']) {
        throw `${element.Título}\n\n No está asignada a ninguna cuadrilla.`;
      }
      if (!element['Etiquetas']) {
        throw `${element.Título}\n\n No tiene Etiquetas`;
      }
      if (!element['Fecha límite']) {
        throw `${element.Título}\n\n No tiene fecha límite`;
      }

      lastValidIndex = index;
      return true;
    }

    if (Object.keys(element).length === 1 && lastValidIndex != null) {
      content[lastValidIndex].Etiquetas += `, ${element.Etiquetas}`;
    }

    return false;
  });
};

export { consolidateTagsAndFilter };
