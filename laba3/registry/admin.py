from django.contrib import admin

from .models import *

class IndividualsAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'legal_entity_name', 'role_in_legal_entity', 'card_number')
    search_fields = ['full_name', 'legal_entity_name', 'role_in_legal_entity', 'card_number']
class Mgmt_department_workerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'address')
    search_fields = ['full_name', 'address']
class CertificatesAdmin(admin.ModelAdmin):
    list_display = ('owner', 'certificate_id')
    search_fields = ['owner__full_name', 'certificate_id']
class Registration_doc_packAdmin(admin.ModelAdmin):
    list_display = ('checked_by', 'certificate_given')
    search_fields = ['checked_by__full_name', 'certificate_given__certificate_id']
class Data_change_doc_packAdmin(admin.ModelAdmin):
    list_display = ('certificate', 'checked_by')
    search_fields = ['certificate__certificate_id', 'certificate__owner__full_name', 'checked_by__full_name']
class Remove_doc_packAdmin(admin.ModelAdmin):
    list_display = ('certificate', 'checked_by')
    search_fields = ['certificate__certificate_id', 'certificate__owner__full_name', 'checked_by__full_name']
class Legal_entitiesAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'certificate', 'record_creation_time', 'removal_query_time')
    search_fields = ['name', 'certificate__owner__full_name', 'certificate__certificate_id', 'address']
    list_filter = ['record_creation_time', 'removal_query_time']
class LicensesAdmin(admin.ModelAdmin):
    list_display = ('license_number', 'issue_date', 'purpose', 'owner')
    search_fields = ['license_number', 'purpose', 'owner__name', 'issue_date']
class AffiliatesAdmin(admin.ModelAdmin):
    list_display = ('affiliate_name', 'address', 'parent_entity')
    search_fields = ['affiliate_name', 'parent_entity__name', 'address']
class Services_relAdmin(admin.ModelAdmin):
    list_display = ('service_name', 'owner')
    search_fields = ['service_name', 'affiliate__affiliate_name', 'legal_entities__name']

admin.site.register(Individuals, IndividualsAdmin)
admin.site.register(Mgmt_department_worker, Mgmt_department_workerAdmin)
admin.site.register(Certificates, CertificatesAdmin)
admin.site.register(Registration_doc_pack, Registration_doc_packAdmin)
admin.site.register(Data_change_doc_pack, Data_change_doc_packAdmin)
admin.site.register(Remove_doc_pack, Remove_doc_packAdmin)
admin.site.register(Legal_entities, Legal_entitiesAdmin)
admin.site.register(Licenses, LicensesAdmin)
admin.site.register(Affiliates, AffiliatesAdmin)
admin.site.register(Services_rel, Services_relAdmin)
