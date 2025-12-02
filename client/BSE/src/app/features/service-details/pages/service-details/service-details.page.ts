import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Service {
  id: string;
  image: string;
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  benefits: string[];
}

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-details.page.html',
  styleUrls: ['./service-details.page.css']
})
export class ServiceDetailsPage implements OnInit {
  service: Service | null = null;

  private servicesData: { [key: string]: Service } = {
    'safe-pack': {
      id: 'safe-pack',
      image: 'safe-pack.png',
      title: 'Safe Pack',
      description: 'Comprehensive inventory management and packaging solutions for modern businesses',
      longDescription: 'Safe Pack is a comprehensive inventory management and packaging solution designed for modern businesses. It streamlines your packaging operations, optimizes inventory tracking, and ensures efficient resource utilization across your organization.',
      features: [
        'Real-time inventory tracking and management',
        'Advanced packaging workflow automation',
        'Multi-warehouse support and coordination',
        'Barcode and QR code integration',
        'Stock level alerts and notifications',
        'Detailed reporting and analytics',
        'Integration with ERP systems',
        'Mobile-friendly interface'
      ],
      benefits: [
        'Reduce packaging errors by up to 95%',
        'Improve inventory accuracy',
        'Streamline warehouse operations',
        'Save time with automated workflows',
        'Better resource allocation',
        'Real-time visibility across all locations'
      ]
    },
    'safe-batch': {
      id: 'safe-batch',
      image: 'safe-batch.png',
      title: 'Safe Batch',
      description: 'Batch processing and production tracking system with real-time monitoring',
      longDescription: 'Safe Batch is a powerful batch processing and production tracking system that provides real-time monitoring and control over your manufacturing operations. It ensures quality, compliance, and efficiency throughout your production lifecycle.',
      features: [
        'Batch creation and management',
        'Real-time production monitoring',
        'Quality control and testing integration',
        'Production scheduling and planning',
        'Material traceability and tracking',
        'Compliance and audit trail management',
        'Performance metrics and KPI tracking',
        'Integration with production equipment'
      ],
      benefits: [
        'Ensure product quality and consistency',
        'Meet regulatory compliance requirements',
        'Reduce production downtime',
        'Optimize resource utilization',
        'Complete traceability from raw materials to finished goods',
        'Data-driven production decisions'
      ]
    },
    'safe-orange': {
      id: 'safe-orange',
      image: 'safe-orange.png',
      title: 'Safe Orange',
      description: 'Agricultural and distribution management platform for efficient operations',
      longDescription: 'Safe Orange is a specialized agricultural and distribution management platform designed to optimize operations in the agricultural sector. From farm to distribution center, it provides end-to-end visibility and control over your supply chain.',
      features: [
        'Farm management and planning',
        'Harvest tracking and scheduling',
        'Distribution route optimization',
        'Cold chain monitoring',
        'Supplier and buyer management',
        'Quality assessment and grading',
        'Price tracking and market analysis',
        'Logistics and transportation management'
      ],
      benefits: [
        'Optimize harvest timing and yields',
        'Reduce spoilage and waste',
        'Improve distribution efficiency',
        'Better supplier relationships',
        'Real-time market insights',
        'Ensure product freshness and quality'
      ]
    },
    'safe-rs': {
      id: 'safe-rs',
      image: 'safe-rs.png',
      title: 'Safe RS',
      description: 'Advanced reporting and analytics system for data-driven decisions',
      longDescription: 'Safe RS is an advanced reporting and analytics system that transforms your business data into actionable insights. With powerful visualization tools and comprehensive reporting capabilities, it empowers you to make data-driven decisions with confidence.',
      features: [
        'Customizable dashboard and reports',
        'Real-time data visualization',
        'Advanced analytics and forecasting',
        'Multi-dimensional data analysis',
        'Scheduled report generation and distribution',
        'Export to multiple formats (PDF, Excel, etc.)',
        'Role-based access control',
        'Integration with all business systems'
      ],
      benefits: [
        'Make informed business decisions',
        'Identify trends and opportunities',
        'Monitor KPIs in real-time',
        'Reduce reporting time by 80%',
        'Improve operational transparency',
        'Better strategic planning'
      ]
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const serviceId = params.get('id');
      if (serviceId && this.servicesData[serviceId]) {
        this.service = this.servicesData[serviceId];
      }
    });
  }
}
