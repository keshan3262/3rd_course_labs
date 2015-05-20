#!/usr/bin/python
# -*- coding: utf-8 -*-
import django
from django.test import TestCase
from registry.models import *
from datetime import *
django.setup()

def insertAll():
    worker1 = Mgmt_department_worker(full_name=u'Бюрократка Марія Петрівна',
                                     address=u'адреса1')
    worker1.save()
    manager1 = Individuals(card_number=1666, full_name=u'Бейзерман Григорій Давидович',
                           legal_entity_name=u'ПП "АТА"', role_in_legal_entity=u'менеджер')
    manager1.save()
    accounter1 = Individuals(card_number=1000, full_name=u'Козлов Юрій Андрійович',
                             legal_entity_name=u'ПП "АТА"', role_in_legal_entity=u'бухгалтер')
    accounter1.save()    
    certificate1 = Certificates(owner=manager1, certificate_id=1)
    certificate1.save()
    pack1 = Registration_doc_pack(application=u'Заява4',
            legal_entity_data= u'Бейзерман Григорій Давидович, ПП "АТА"', checked_by=worker1,
            certificate_given=Certificates.objects.all().get(owner__full_name=u'Бейзерман Григорій Давидович'), card_id=1)
    pack1.save()
    dt1 = datetime.now()
    dt2 = datetime(dt1.year - 4, dt1.month, dt1.day)
    ent1 = Legal_entities(name=u'ПП "АТА"', address=u'адреса5', statutory_capital=25000,
                    manager=manager1, certificate = Certificates.objects.get(owner=manager1),
                    accounter=accounter1, record_creation_time=dt2, removal_query_time=None)
    ent1.save()
    service1 = Services_rel(service_name=u'послуга6', providing_rules=u'правила6',
                            legal_entities=ent1, relation_ID=1)
    service1.save()    

class DbTestCase(TestCase):
    def test_ainsert(self):
        insertAll()
        self.assertEqual(len(Mgmt_department_worker.objects.all()), 1)
        self.assertEqual(len(Individuals.objects.all()), 2)
        self.assertEqual(len(Certificates.objects.all()), 1)
        self.assertEqual(len(Registration_doc_pack.objects.all()), 1)
        self.assertEqual(len(Legal_entities.objects.all()), 1)
        self.assertEqual(len(Services_rel.objects.all()), 1)
    def test_bselect(self):
        insertAll()
        query1 = Registration_doc_pack.objects.filter(checked_by__full_name=
                        u'Бюрократка Марія Петрівна', certificate_given__isnull=False)
        self.assertEqual(len(query1), 1)
        self.assertTrue(query1[0].certificate_given.legal_entities.name == u'ПП "АТА"')
    def test_cupdate(self):
        insertAll()
        self.assertEqual(len(Legal_entities.objects.all()), 1)
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
        ent1 = Legal_entities.objects.get(name=u'ПП "АТА"')
        self.assertEqual(ent1.manager.full_name, u'Козлов Юрій Андрійович')
        self.assertEqual(ent1.manager.role_in_legal_entity, u'менеджер')
        self.assertEqual(ent1.accounter.full_name, u'Бейзерман Григорій Давидович')
        self.assertEqual(ent1.accounter.role_in_legal_entity, u'бухгалтер')
    def test_delete(self):
        insertAll()
        service1 = Services_rel.objects.get(service_name=u'послуга6')
        service1.delete()
        self.assertEqual(len(Services_rel.objects.all()), 0)
        self.assertNotEqual(len(Legal_entities.objects.all()), 0)
