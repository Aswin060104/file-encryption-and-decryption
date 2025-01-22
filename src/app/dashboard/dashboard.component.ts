import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  lineChartData = [
    {
      data: [1, 2, 3, 6, 7],
      label: 'Sales',
    },
  ];
  lineChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May']; // Ensure labels match data length
  lineChartOptions = {
    responsive: true,
  };
  lineChartColors = [
    {
      borderColor: 'rgba(0,99,132,1)',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
  ];
  lineChartLegend = true;
}
