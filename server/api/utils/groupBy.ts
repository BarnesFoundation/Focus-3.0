export function groupBy<T>(
  list: Array<T>,
  identifier: string
): { [identifier: string]: Array<T> } {
  const groupedResultList = list.reduce(function (acc, item) {
    acc[item[identifier]] = acc[item[identifier]] || [];
    acc[item[identifier]].push(item);
    return acc;
  }, {});
  return groupedResultList;
}
