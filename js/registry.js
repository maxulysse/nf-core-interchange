// Each maps/<id>.js calls registerMap, so this loads before them.
const MAPS = {};
const registerMap = (m) => {
  MAPS[m.id] = { title: `${m.id[0].toUpperCase()}${m.id.slice(1)} Interchange`, ...m };
};
