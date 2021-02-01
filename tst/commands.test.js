const { CommandValidationError } = require('../exceptions');
const parser = require('../commands');

describe('Command Parser', () => {
  test('it should return null when text does not start with command prefix', () => {
    let result = parser.parse('add!');
    expect(result).toBe(null);
  });

  test('it should still return with unknown command', () => {
    let result = parser.parse('!unknown some_parameter');
    expect(result.commandType).toBe('unknown');
  });
});

describe('!help Command Parser', () => {
  test('it should work with no additional paramaters', () => {
    let result = parser.parse('!help')
    expect(result.commandType).toBe('help');
  });

  test('it should still return with unknown command', () => {
    let result = parser.parse('!help');
    expect(result.commandType).toBe('help');
  })
});


describe('!add Command Parser', () => {
  test('it should work with no additional paramaters', () => {
    let result = parser.parse('!add')

    expect(result.commandType).toBe('add');
    expect(result.options.game).toBe(null);
    expect(result.options.tronAuth).toBe(null);
    expect(result.options.removeInMinutes).toBeGreaterThanOrEqual(1)
    expect(result.options.removeInMinutes).toBeLessThanOrEqual(500)
  });

  test('it should work with all parameters', () => {
    const gameName = 'someGame';
    const auth = 'test@example.com';
    const mins = 30;

    let result = parser.parse(`!add ${gameName} ${auth} --autoremove ${mins}`);

    expect(result.commandType).toBe('add');
    expect(result.options.game).toBe(gameName);
    expect(result.options.tronAuth).toBe(auth);
    expect(result.options.removeInMinutes).toBe(mins)
  });

  test('it should work with extra spaces', () => {
    let result = parser.parse('!add ')

    expect(result.commandType).toBe('add');
    expect(result.options.game).toBe(null);
    expect(result.options.tronAuth).toBe(null);
  });

  test('it should work with --autoremove option only', () => {
    const mins = 30;
    let result = parser.parse(`!add --autoremove ${mins}`)

    expect(result.commandType).toBe('add');
    expect(result.options.game).toBe(null);
    expect(result.options.tronAuth).toBe(null);
    expect(result.options.removeInMinutes).toBe(mins);
  });

  test('it should throw error when --autoremove option is oiut of range', () => {
    expect(() => parser.parse('!add --autoremove 100000')).toThrow(/must be in range/);
  });
});

describe('!remove Command Parser', () => {
  test('it should work with no additional paramaters', () => {
    let result = parser.parse('!remove')

    expect(result.commandType).toBe('remove');
    expect(result.options.game).toBe(null);
  });

  test('it should work with all paramaters', () => {
    const gameName = 'someGame';
    let result = parser.parse(`!remove ${gameName}`);

    expect(result.commandType).toBe('remove');
    expect(result.options.game).toBe(gameName);
  });
});


describe('!autoremove Command Parser', () => {
  test('it should work with time paramaters', () => {
    const mins = 30;
    let result = parser.parse(`!autoremove ${mins}`)

    expect(result.commandType).toBe('autoremove');
    expect(result.options.removeInMinutes).toBe(mins);
  });

  test('it should throw exception without required parameter', () => {
    expect(() => parser.parse('!autoremove')).toThrow(/Not enough.+arguments/);
  });

  test('it should throw error when autoremove value is out of range', () => {
    expect(() => parser.parse('!autoremove 100000')).toThrow(/must be in range/);
  });
});

describe('!who Command Parser', () => {
  test('it should work with no additional paramaters', () => {
    let result = parser.parse('!who')
    expect(result.commandType).toBe('who');
  });

  test('it should still return with unknown command', () => {
    let result = parser.parse('!who');
    expect(result.commandType).toBe('who');
  });
});

describe('!help Command Parser', () => {
  test('it should work with no additional paramaters', () => {
    let result = parser.parse('!help')
    expect(result.commandType).toBe('help');
  });

  test('it should still return with unknown command', () => {
    let result = parser.parse('!help');
    expect(result.commandType).toBe('help');
  })
});
