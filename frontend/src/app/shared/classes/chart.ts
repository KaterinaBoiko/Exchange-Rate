import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';

export class ChartConfigs {
    datasets: ChartDataSets[];
    labels: string[];
    options: ChartOptions;
    type: ChartType;

    constructor(datasets: ChartDataSets[], labels: string[], options?: ChartOptions) {
        this.datasets = datasets;
        this.labels = labels;
        this.options = options || {};
        this.type = 'line';
    }
}