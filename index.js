'use strict';
const rollup = require('rollup');
const memory = require('rollup-plugin-memory');
const pathResolve = require('path').resolve;

class RollupCompiler {
  constructor(config) {
    if (config == null) config = {};
    var pluginConfig = config.plugins && config.plugins.rollup || {};
    if (pluginConfig.entry) {
      this.pattern = new RegExp(pluginConfig.entry);
    }
    this.config = pluginConfig;
    this.extension = pluginConfig.extension || 'js';
    delete pluginConfig.extension;
  }

  compile(params) {
    const path = pathResolve(params.path); // this fixes an issue where using rollup plugins like typescript filters out the file
    const data = params.data;
    const config = this.config;
    const plugins = (config.plugins || []).slice();
    plugins.push(memory({
      contents: data
    }));
    return rollup.rollup({
      entry: path,
      plugins: plugins
    }).then((bundle) => {
      const compiled = bundle.generate({
        format: config.format || 'umd',
        moduleName: config.moduleName,
        sourceMap: config.sourceMap || 'none'
      });
      var code;
      if (this.map === 'linked') {
        code = compiled.code.replace('//# sourceMappingURL=undefined.map\n', '');
      } else {
        code = compiled.code;
      }
      return {
        data: code,
        map: compiled.map.toString()
      };
    });
  }
}

RollupCompiler.prototype.brunchPlugin = true;
RollupCompiler.prototype.type = 'javascript';

module.exports = RollupCompiler;
