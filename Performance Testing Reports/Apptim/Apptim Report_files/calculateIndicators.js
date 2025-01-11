/**
 * filter all the indicators looking at the metadata and tsv files.
 * t0 = start time
 * t1 = end time
 */
const calculateIndicators = (t0, t1) => {
    let result = [];
    for(let tsvFile in state.tsvFiles) {
        const tsv = state.tsvFiles[tsvFile];
        /**
         * indicators that shares the same tsv file will result in array of objects
         * e.g [{indicator: 'app_cpu_max'}, {indicator: 'app_cpu_avg'}]
         */     
        const indicators = state.testResultFilter.filter(indicator => indicator.metadata.categoryFile == tsvFile);
        if(indicators.length > 0) {
          indicators.forEach(indicator => {
                const aggregationResult = calculateIndicator(tsv, indicator, t0, t1);
                result.push(aggregationResult);
            })
        }
    }
    return result;
}

const calculateIndicator = (tsv, indicator, t0 = null, t1 = null) => {
    const seriesName = indicator.metadata.seriesName;
    const key = indicator.key;
    const title = indicator.metadata.title;
    const color = indicator.metadata.color;
    const displayUnit = indicator.metadata.displayUnit;
    const filterBy = indicator.metadata.filterBy;
    let indicatorValues = [];
    let raw, factorized = 0;

    // If t0 and t1 were specified, filter between
    if(t0 != null && t1 != null) {
      tsv = tsv.filter(t => t.time >= t0 && t.time <= t1);
    }
  
    // If the indicator has the filterBy property and the column exists:
    if(filterBy && tsv.length > 0 && filterBy["columnName"] in tsv[0]) {
      tsv = getFilteredTsv(filterBy, tsv);
    }
    
    tsv.forEach((row) => {
      const columnValue = parseInt(row[indicator.metadata.seriesColumn]);
      if(columnValue >= 0) {
        indicatorValues.push(columnValue);
      }
    });
  
    raw = aggregateValues(indicatorValues, indicator.metadata.aggregation);
    factorized = (raw / indicator.metadata.divideFactor).toFixed(1);
    
  return {seriesName, key, title, displayUnit, color, raw: raw, factorized: factorized};
}

/**
 * Calculates an indicator based on a tsv file, a column and an aggregate function
 */
const aggregateValues = (indicatorValues, type) => {
    if(indicatorValues.length > 0) {
        switch (type) {
          case "max":
            return Math.max.apply(Math, indicatorValues);
          case "avg":
            return indicatorValues.reduce((a, b) => a + b, 0) / indicatorValues.length;
          case "sum":
            return indicatorValues.reduce((a, b) => a + b, 0);
          case "top":
            return indicatorValues[0];
          case "diff":
            if (indicatorValues.length > 1) {
              return indicatorValues[indicatorValues.length - 1] - indicatorValues[0];
            }
        }
      }
}


const getFilteredTsv = (filterBy, tsv) => {
    /* filterColumnName: The name of the column to filter by. e.g. "launch_type"
       filterOperator: The operator to use when filtering. e.g. "=="
       filterValue: The value to filter by. e.g. "COLD"
    */
    const {"columnName": filterColumnName, "operator": filterOperator, "value": filterValue} = filterBy;
    let filteredValues = [];
  
    tsv.map(t => {
      if(eval(`'${t[filterColumnName]}'${filterOperator}'${filterValue}'`)) {
        filteredValues.push(t);
      }
    });
    
    return filteredValues;
}

if(typeof exports === "object") {
  module.exports = { calculateIndicator, calculateIndicators, getFilteredTsv, aggregateValues }
}
