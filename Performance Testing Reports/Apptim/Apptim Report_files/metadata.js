function getIndicatorMetadata(indicatorKey) {
    for (category in state.metadata.categories) {
        let categoryElement = state.metadata.categories[category];
        for (series in categoryElement.series) {
            let seriesElement = categoryElement.series[series];
            for (indicator in seriesElement.indicators) {
                let indicatorElement = seriesElement.indicators[indicator];
                if (camelToSnakeCase(indicator) == indicatorKey) {
                    const indicatorMetadata = {
                        categoryName: category,
                        seriesName: series,
                        categoryFile: categoryElement.file,
                        seriesColumn: seriesElement.column,
                        platform: seriesElement.platform != undefined ? seriesElement.platform : "all",

                        title: indicatorElement.title,
                        aggregation: indicatorElement.aggregation,
                        isCard: indicatorElement.isCard != undefined ? indicatorElement.isCard : false,
                        cardPosition: indicatorElement.cardPosition ? indicatorElement.cardPosition : null,
                        filterBy: seriesElement.filterBy,

                        // Display info may not exist. Use of default values if undefined
                        displayUnit: seriesElement.display != undefined && seriesElement.display.unit != undefined
                        ? seriesElement.display.unit : 
                        seriesElement.rawUnit != undefined ? seriesElement.rawUnit : "",

                        divideFactor: seriesElement.display != undefined && seriesElement.display.divideFactor != undefined
                        ? seriesElement.display.divideFactor : 1,

                        decimalPoint: seriesElement.display != undefined && seriesElement.display.decimalPoint != undefined
                        ? seriesElement.display.decimalPoint : true,

                        color: seriesElement.display != undefined && seriesElement.display.color != undefined
                        ? seriesElement.display.color : 
                        categoryElement.color != undefined ? categoryElement.color : ""


                    };
                    return indicatorMetadata;
                }
            }
        }
    }
}