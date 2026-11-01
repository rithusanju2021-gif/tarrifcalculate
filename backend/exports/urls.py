from django.urls import path
from .views import ExportPDFView, WhatsAppFormatView, BackupExportView, BackupImportView, ClearAllDataView

urlpatterns = [
    path('pdf/', ExportPDFView.as_view(), name='export_pdf'),
    path('whatsapp/', WhatsAppFormatView.as_view(), name='export_whatsapp'),
    path('backup/', BackupExportView.as_view(), name='export_backup'),
    path('restore/', BackupImportView.as_view(), name='import_backup'),
    path('clear-all/', ClearAllDataView.as_view(), name='clear_all_data'),
]
