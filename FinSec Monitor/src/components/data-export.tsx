"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  AlertTriangle,
  Database,
  FileSpreadsheet,
  FileImage,
  Mail,
  Share2,
  Filter,
  Zap,
  TrendingUp,
  Activity,
  Globe,
  Server,
  Webhook,
  GitBranch,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

interface ExportConfig {
  format: 'csv' | 'json' | 'pdf' | 'xlsx';
  dateRange: {
    from: Date;
    to: Date;
  };
  dataTypes: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  compression: boolean;
  emailDelivery: boolean;
  recipients: string[];
}

interface ExportJob {
  id: string;
  name: string;
  format: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  error?: string;
}

export default function DataExport() {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      to: new Date()
    },
    dataTypes: ['servers', 'applications', 'alerts'],
    includeCharts: true,
    includeRawData: true,
    compression: false,
    emailDelivery: false,
    recipients: []
  });

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([
    {
      id: '1',
      name: 'Weekly Performance Report',
      format: 'pdf',
      status: 'completed',
      progress: 100,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3000000).toISOString(),
      fileSize: '2.4 MB',
      downloadUrl: '/exports/weekly-report.pdf'
    },
    {
      id: '2',
      name: 'Server Metrics Export',
      format: 'csv',
      status: 'running',
      progress: 67,
      createdAt: new Date(Date.now() - 600000).toISOString()
    },
    {
      id: '3',
      name: 'Alert History Analysis',
      format: 'json',
      status: 'failed',
      progress: 23,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      error: 'Insufficient permissions for alert data'
    }
  ]);

  const [isExporting, setIsExporting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const dataTypeOptions = [
    { id: 'servers', label: 'Server Metrics', icon: Server, description: 'CPU, memory, disk usage' },
    { id: 'applications', label: 'Application Data', icon: Globe, description: 'Response times, uptime' },
    { id: 'apis', label: 'API Endpoints', icon: Database, description: 'Request/response data' },
    { id: 'webhooks', label: 'Webhook Logs', icon: Webhook, description: 'Delivery status, events' },
    { id: 'workflows', label: 'Workflow Executions', icon: GitBranch, description: 'Run history, performance' },
    { id: 'alerts', label: 'Alert History', icon: AlertTriangle, description: 'Alert incidents, resolutions' },
    { id: 'team', label: 'Team Activity', icon: Activity, description: 'User actions, availability' },
    { id: 'ai-insights', label: 'AI Analytics', icon: TrendingUp, description: 'Predictions, anomalies' }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet compatible' },
    { value: 'json', label: 'JSON', icon: FileText, description: 'Structured data format' },
    { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Formatted report' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `${exportConfig.format.toUpperCase()} Export - ${format(new Date(), 'MMM dd, yyyy')}`,
      format: exportConfig.format,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setExportJobs([newJob, ...exportJobs]);

    // Simulate export process
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setExportJobs(jobs => jobs.map(job => 
          job.id === newJob.id 
            ? {
                ...job,
                status: 'completed',
                progress: 100,
                completedAt: new Date().toISOString(),
                fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
                downloadUrl: `/exports/${newJob.id}.${exportConfig.format}`
              }
            : job
        ));
        setIsExporting(false);
      } else {
        setExportJobs(jobs => jobs.map(job => 
          job.id === newJob.id 
            ? { ...job, status: 'running', progress }
            : job
        ));
      }
    }, 500);
  };

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = job.downloadUrl;
      link.download = job.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleScheduleReport = () => {
    // Implement scheduled report functionality
    console.log('Scheduling report with config:', exportConfig);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format: string) => {
    const option = formatOptions.find(opt => opt.value === format);
    return option ? option.icon : FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Data Export & Reports</h2>
            <p className="text-slate-600 dark:text-slate-400">Export monitoring data and generate reports</p>
          </div>
        </div>
        <Button onClick={handleScheduleReport} variant="outline">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Export Format
              </CardTitle>
              <CardDescription>Choose the format for your exported data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        exportConfig.format === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                      onClick={() => setExportConfig({ ...exportConfig, format: option.value as any })}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">{option.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Date Range Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Date Range
              </CardTitle>
              <CardDescription>Select the time period for data export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(exportConfig.dateRange.from, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportConfig.dateRange.from}
                        onSelect={(date) => {
                          if (date) {
                            setExportConfig({
                              ...exportConfig,
                              dateRange: { ...exportConfig.dateRange, from: date }
                            });
                          }
                          setShowCalendar(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(exportConfig.dateRange.to, 'MMM dd, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={exportConfig.dateRange.to}
                        onSelect={(date) => {
                          if (date) {
                            setExportConfig({
                              ...exportConfig,
                              dateRange: { ...exportConfig.dateRange, to: date }
                            });
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Types Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Types
              </CardTitle>
              <CardDescription>Select which data to include in the export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {dataTypeOptions.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div key={type.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={type.id}
                        checked={exportConfig.dataTypes.includes(type.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExportConfig({
                              ...exportConfig,
                              dataTypes: [...exportConfig.dataTypes, type.id]
                            });
                          } else {
                            setExportConfig({
                              ...exportConfig,
                              dataTypes: exportConfig.dataTypes.filter(id => id !== type.id)
                            });
                          }
                        }}
                      />
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400 mt-0.5" />
                        <div>
                          <label htmlFor={type.id} className="text-sm font-medium cursor-pointer">
                            {type.label}
                          </label>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Include Charts</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Add visual charts to the export</div>
                  </div>
                  <Checkbox
                    checked={exportConfig.includeCharts}
                    onCheckedChange={(checked) =>
                      setExportConfig({ ...exportConfig, includeCharts: checked as boolean })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Include Raw Data</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Export raw data points</div>
                  </div>
                  <Checkbox
                    checked={exportConfig.includeRawData}
                    onCheckedChange={(checked) =>
                      setExportConfig({ ...exportConfig, includeRawData: checked as boolean })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compress Export</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Create compressed archive</div>
                  </div>
                  <Checkbox
                    checked={exportConfig.compression}
                    onCheckedChange={(checked) =>
                      setExportConfig({ ...exportConfig, compression: checked as boolean })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Delivery</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Send export via email</div>
                  </div>
                  <Checkbox
                    checked={exportConfig.emailDelivery}
                    onCheckedChange={(checked) =>
                      setExportConfig({ ...exportConfig, emailDelivery: checked as boolean })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button 
            onClick={handleExport}
            disabled={isExporting || exportConfig.dataTypes.length === 0}
            className="w-full"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Start Export'}
          </Button>
        </div>

        {/* Export History */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Export History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exportJobs.map((job) => {
                  const Icon = getFormatIcon(job.format);
                  return (
                    <div key={job.id} className="p-4 border rounded-lg dark:border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <div>
                            <div className="font-medium text-sm">{job.name}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {format(new Date(job.createdAt), 'MMM dd, HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Badge variant="outline" className="text-xs">
                            {job.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      {job.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(job.progress)}%</span>
                          </div>
                          <Progress value={job.progress} className="h-1" />
                        </div>
                      )}
                      
                      {job.status === 'completed' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-400">
                            Size: {job.fileSize}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(job)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                      
                      {job.status === 'failed' && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Error: {job.error}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Performance Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Export Alert History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Download AI Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share with Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}