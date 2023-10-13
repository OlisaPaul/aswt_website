module.exports = function getSmsDate(date) {
  const [dateWithoutTz, Tz] = date.split("+");

  date = new Date(dateWithoutTz);

  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};
