#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import sys
import django
from datetime import *
if __name__ == '__main__':
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "laba3.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
from registry.models import *
django.setup()

def selectOperations():
    #select name from registry_registration_doc_pack a, registry_legal_entities b
    #where b.certificate_id = a.certificate_given_id AND
    #a.checked_by_id = 'Бюрократка Марія Петрівна';
    query1 = Registration_doc_pack.objects.filter(checked_by__full_name=
            u'Бюрократка Марія Петрівна', certificate_given__isnull=False)
    print u'Here are legal entities which were licensed by Бюрократка Марія Петрівна:'
    if (len(query1) == 0):
        print("No such ones.")
    else:
        for obj1 in query1:
            print obj1.certificate_given.legal_entities.name
    #select owner_name from registry_certificates a, registry_legal_entities b,
    #registry_services_rel c, registry_affiliates d where c.service_name = 'послуга1'
    #AND (c.legal_entities_name_id = b.name OR (c.affiliate_name_id = d.affiliate_name
    #AND d.parent_entity_name_id = b.name)) AND b.certificate_id = a.certificate_id
    #GROUP BY owner_name;
    #and the same query but for 'послуга4' instead of 'послуга1'
    services = [u'послуга1', u'послуга4', u'послуга6']
    for service1 in services:
        query1 = Services_rel.objects.filter(service_name = service1)
        names = []
        for obj1 in query1:
            legal = []
            if obj1.affiliate != None:
                legal = obj1.affiliate.parent_entity
            else:
                legal = obj1.legal_entities
            names.append(legal.certificate.owner.full_name)
        names1 = set(names)
        print "Here are names of those whose legal entities and their affiliates "\
              "provide service '" + service1 + "':"
        if (len(names1) == 0):
            print("No such ones.")
        else:
            for name in names1:
                print name
    #select name, certificate_id from registry_legal_entities where
    #NOW() > ADDDATE(record_creation_time, INTERVAL 3 YEAR);
    dt1 = datetime.now()
    query1 = Legal_entities.objects.filter(record_creation_time__lt=
                                           datetime(dt1.year - 3, dt1.month, dt1.day + 1))
    print "Here are legal entities' names and certificate numbers " \
          "record about which was created 3 years ago or earlier:"
    if (len(query1) == 0):
        print("No such ones.")
    else:
        for obj1 in query1:
            print obj1.name + ", " + str(obj1.certificate.certificate_id)    

def insertOperations():
    worker1 = Mgmt_department_worker.objects.get(full_name=u'Бюрократка Марія Петрівна')
    manager1 = Individuals(card_number=1666, full_name=u'Бейзерман Григорій Давидович',
                            legal_entity_name=u'ПП "АТА"', role_in_legal_entity=u'менеджер')
    manager1.save()
    accounter1 = Individuals(card_number=1000, full_name=u'Козлов Юрій Андрійович',
                            legal_entity_name=u'ПП "АТА"', role_in_legal_entity=u'бухгалтер')
    accounter1.save()    
    certificate1 = Certificates(owner=manager1)
    certificate1.save()
    pack1 = Registration_doc_pack(application=u'Заява4', legal_entity_data= u'Бейзерман Григорій Давидович, ПП "АТА"', checked_by=worker1, certificate_given=Certificates.objects.all().get(owner__full_name=u'Бейзерман Григорій Давидович'))
    pack1.save()
    dt1 = datetime.now()
    dt2 = datetime(dt1.year - 4, dt1.month, dt1.day)
    ent1 = Legal_entities(name=u'ПП "АТА"', address=u'адреса5', statutory_capital=25000,
            manager=manager1, certificate = Certificates.objects.get(owner=manager1),
            accounter=accounter1, record_creation_time=dt2, removal_query_time=None)
    ent1.save()
    service1 = Services_rel(service_name=u'послуга6', providing_rules=u'правила6',
                            legal_entities=ent1)
    service1.save()

def updateOperations():
    #swapping accounter and manager
    ent1 = Legal_entities.objects.get(name=u'ПП "АТА"')
    tipamanager = ent1.manager
    tipaaccounter = ent1.accounter
    certificate1 = Certificates.objects.get(owner=tipamanager)
    certificate1.owner = tipaaccounter
    tipamanager.role_in_legal_entity = u'бухгалтер'
    tipaaccounter.role_in_legal_entity = u'менеджер'
    certificate1.save()
    tipamanager.save()
    tipaaccounter.save()
    ent1.manager = tipaaccounter
    ent1.accounter = tipamanager
    ent1.save()    
    #enabling 'ЗАТ "Нова Школа"' to provide 'послуга6' instead of 'послуга2'
    service1 = Services_rel.objects.get(service_name=u'послуга2', 
                                        legal_entities__name=u'ЗАТ "Нова Школа"')
    service1.service_name = 'послуга6'
    service1.save()
    
def deleteOperations():
    ent1 = Legal_entities.objects.get(name=u'ПП "АТА"')
    certificate1 = ent1.certificate
    Registration_doc_pack.objects.get(certificate_given=certificate1).delete()
    Services_rel.objects.filter(legal_entities=ent1).delete()
    Affiliates.objects.filter(parent_entity=ent1).delete()
    ent1.delete()
    service1 = Services_rel.objects.get(service_name='послуга6', 
                                            legal_entities__name='ЗАТ "Нова Школа"')
    service1.service_name = 'послуга2'
    service1.save()
    certificate1.delete()
    Individuals.objects.filter(legal_entity_name=u'ПП "АТА"').delete()

#print("-----------------------------------")
#print("Results of selects before changes:")
#print("-----------------------------------")
#selectOperations()
#insertOperations()
#print("-----------------------------------")
#print(u'Info inserted: Бейзерман Григорій Давидович, ПП "АТА", certificate was given, '\
#      u'address: адреса5, бухгалтер: Козлов Юрій Андрійович, послуга6 is provided '\
#      u'according to правила6, record was created today minus 4 years')
#print("Results of selects after insert operations:")
#print("-----------------------------------")
#selectOperations()
#updateOperations()
#print("-----------------------------------")
#print(u'Info updated: accounter and manager of ПП "АТА" have been swapped, ЗАТ "Нова Школа" started providing \'послуга6\' instead of \'послуга2\'')
#print("Results of selects after update operations:")
#print("-----------------------------------")
#selectOperations()
#deleteOperations()
#print("-----------------------------------")
#print(u'All inserted info has been deleted and all other changes have been undone')
#print("Results of selects after delete operations:")
#print("-----------------------------------")
#selectOperations()
