const filterByLimitDate = (dataList, dateToEval) => {
  const today = new Date(dateToEval + "T00:00:00");
  today.setHours(0, 0, 0, 0);
  
  return dataList.filter((element) => {
    const limitDate = element['Fecha límite'];
    limitDate.setHours(0, 0, 0, 0);

    if (!(limitDate instanceof Date)) return false;

    return (
      limitDate.getUTCDate() === today.getUTCDate() &&
      limitDate.getUTCMonth() === today.getUTCMonth() &&
      limitDate.getUTCFullYear() === today.getUTCFullYear()
    );
  });
};

export { filterByLimitDate };
