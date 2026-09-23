process.on("message", async ({ id, limit }) => {
  let sum = 0;
  const step = Math.max(1, Math.floor(limit / 100));
  let sentPercent = 0;
  let sinceLastSend = 0;

  for (let i = 1; i <= limit; i++) {
    sum += i;
    sinceLastSend++;

    if (sinceLastSend >= step) {
      sinceLastSend = 0;
      const percent = Math.floor((i / limit) * 100);
      if (percent > sentPercent) {
        sentPercent = percent;
        process.send({ id, type: "progress", current: i, limit, percent });
        await new Promise((resolve) => setImmediate(resolve));
      }
    }
  }

  process.send({ id, type: "done", result: sum });
  process.exit(0);
});