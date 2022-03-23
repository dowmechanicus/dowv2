import axios from 'axios';

async function rbf2json(path, type) {
  if (!path) {
    throw new Error('No path given');
  }

  if (type !== 'sbps' && type !== 'ebps') {
    throw new Error('Wrong type given');
  }

  const res = await axios.get(`/api/codex/${path}`, {
    params: {
      type
    }
  });

  return type === 'sbps' ? res.data.sbps : res.data.ebps;
}
