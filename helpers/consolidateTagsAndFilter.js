const consolidateTagsAndFilter = (content) => {
  let lastValidIndex = null;

  return content.filter((element, index) => {
    if (Object.keys(element).length === 4) {
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
