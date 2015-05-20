#!/usr/bin/python
# -*- coding: utf-8 -*-
from django.db import models
from django.utils.encoding import *

class Mgmt_department_worker(models.Model):
    full_name = models.CharField(max_length=45, primary_key=True)
    address = models.CharField(max_length=255)
    def __str__(self):
        return self.full_name.encode('utf-8')


class Individuals(models.Model):
    card_number = models.BigIntegerField(primary_key=True)
    full_name = models.CharField(max_length=45)
    legal_entity_name = models.CharField(max_length=45)
    role_in_legal_entity = models.CharField(max_length=45)
    def __str__(self):
        return self.full_name.encode('utf-8')
    

class Certificates(models.Model):
    certificate_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(Individuals)
    def __str__(self):
        return (u"№%d, %s" % (self.certificate_id, self.owner.full_name)).encode('utf-8')


class Registration_doc_pack(models.Model):
    card_id = models.AutoField(primary_key=True)
    application = models.TextField()
    legal_entity_data = models.TextField()
    checked_by = models.ForeignKey(Mgmt_department_worker, on_delete=models.DO_NOTHING)
    certificate_given = models.ForeignKey(Certificates, null=True, blank=True,
                                          on_delete=models.DO_NOTHING)
    def __str__(self):
        return (u"№%d" % self.card_id).encode('utf-8')
    def certificateWasGiven(self):
        return (certificate_given != None)

class Data_change_doc_pack(models.Model):
    doc_pack_id = models.AutoField(primary_key=True)
    certificate = models.ForeignKey(Certificates, on_delete=models.DO_NOTHING)
    changes_info = models.TextField()
    checked_by = models.ForeignKey(Mgmt_department_worker, on_delete=models.DO_NOTHING)
    def __str__(self):
        return (u"№%d" % self.doc_pack_id).encode('utf-8')    

    
class Remove_doc_pack(models.Model):
    doc_pack_id = models.AutoField(primary_key=True)
    application = models.TextField()
    message_in_massmedia = models.TextField()
    certificate = models.ForeignKey(Certificates, on_delete=models.DO_NOTHING)
    checked_by = models.ForeignKey(Mgmt_department_worker, on_delete=models.DO_NOTHING)
    def __str__(self):
        return (u"№%d" % self.doc_pack_id).encode('utf-8') 

class Legal_entities(models.Model):
    name = models.CharField(max_length=45, primary_key=True)
    address = models.CharField(max_length=255)
    statutory_capital = models.IntegerField(null=True, blank=True)
    manager = models.ForeignKey(Individuals, related_name='manager')
    certificate = models.OneToOneField(Certificates)
    accounter = models.ForeignKey(Individuals, related_name='accounter')
    record_creation_time = models.DateTimeField()
    removal_query_time = models.DateTimeField(null=True, blank=True)
    def __str__(self):
        return self.name.encode('utf-8')

class Licenses(models.Model):
    license_number = models.BigIntegerField(primary_key=True)
    purpose = models.CharField(max_length=45)
    issue_date = models.DateTimeField()
    owner = models.ForeignKey(Legal_entities, on_delete=models.DO_NOTHING)
    def __str__(self):
        return (u"№%d %s" % (self.license_number, str(self.issue_date))).encode('utf-8')    


class Affiliates(models.Model):
    affiliate_name = models.CharField(max_length=45, primary_key=True)
    address = models.CharField(max_length=255)
    parent_entity = models.ForeignKey(Legal_entities, on_delete=models.DO_NOTHING)
    def __str__(self):
        return self.affiliate_name.encode('utf-8')


class Services_rel(models.Model):
    service_name = models.CharField(max_length=45)
    providing_rules = models.TextField()
    affiliate = models.ForeignKey(Affiliates, null=True, blank=True,
                                  on_delete=models.DO_NOTHING)
    legal_entities = models.ForeignKey(Legal_entities, null=True, blank=True,
                                            on_delete=models.DO_NOTHING)
    relation_ID = models.AutoField(primary_key=True)
    def owner(self):
        name1 = ''
        if (self.affiliate == None):
            name1 = self.legal_entities.name
        else:
            name1 = self.affiliate.affiliate_name
        return name1
    def __str__(self):
        content = (self.service_name + u' from ' + owner(self)).encode('utf-8')
        return content
