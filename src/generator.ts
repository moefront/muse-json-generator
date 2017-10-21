import MuseGenerator from './MuseGenerator';

async function generator(...args: Array<any>): Promise<string> {
  const museGenerator = new MuseGenerator(...args);
  return await museGenerator.build();
}

export = generator;
