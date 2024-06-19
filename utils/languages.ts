import iso6391 from 'iso-639-1';

const languages = iso6391.getAllNames().map((name) => ({
  name,
  code: iso6391.getCode(name),
}));

export default languages;
