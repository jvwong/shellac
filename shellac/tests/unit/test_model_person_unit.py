from django.test import TestCase
from django.contrib.auth.models import User
from shellac.models import Person, Relationship

##Fake user
username1 = 'jray'
password1 = 'j'
email1 = 'jray@outlook.com'

username2 = 'aray'
password2 = 'a'
email2 = 'aray@outlook.com'

username3 = 'kray'
password3 = 'k'
email3 = 'kray@outlook.com'

class PersonModelTest(TestCase):

    def test_creating_User_accompanied_by_Person_creation(self):

        u1 = User.objects.create_user(username=username1, password=password1)

        self.assertTrue(User.objects.all().count(), 1)
        self.assertTrue(User.objects.get(username=username1).username, username1)

        #Verify the Person attribute exists on the User
        self.assertIsNotNone(User.objects.get(username=username1).person)

        #Verify the User attribute object exists on the Person
        self.assertTrue(Person.objects.all().count(), 1)
        self.assertTrue(Person.objects.get(user=u1).user.username, username1)
        self.assertIsNotNone(Person.objects.get(user=u1).joined)
        self.assertIsNotNone(Person.objects.get(user=u1).relationships)


class RelationshipModelTest(TestCase):

    def test_creating_add_and_remove_relationship_FOLLOWING(self):
         #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        p1 = u1.person
        p2 = u2.person
        self.assertTrue(User.objects.all().count(), 2)
        self.assertTrue(Person.objects.all().count(), 2)

        #Add p1 following p2
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify p1 following p2 created
        relQuery = Relationship.objects.filter(from_person=p1, to_person=p2)
        self.assertEqual(len(relQuery), 1)
        self.assertEqual(p1.relationships.all().count(), 1)

        self.assertEqual(relQuery[0], rel12)
        self.assertEqual(relQuery[0].from_person, p1)
        self.assertEqual(relQuery[0].to_person, p2)

        #Verify p2 is not following p1 -- that is, asymmetric
        relQuery_reverse = Relationship.objects.filter(from_person=p2, to_person=p1)
        self.assertEqual(len(relQuery_reverse), 0)
        self.assertEqual(p2.relationships.all().count(), 0)

        #Remove p1 following p2
        p1.remove_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify p1 following p2 created
        relQuery_removed = Relationship.objects.filter(from_person=p1, to_person=p2)
        self.assertEqual(len(relQuery_removed), 0)
        self.assertEqual(p1.relationships.all().count(), 0)


    def test_creating_cannot_add_relationship_FOLLOWING_multiple_times(self):
        #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        p1 = u1.person
        p2 = u2.person
        self.assertTrue(User.objects.all().count(), 2)
        self.assertTrue(Person.objects.all().count(), 2)

        #Add p1 following p2
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)
        rel12b = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify p1 following p2 created only 1 Relationship object
        self.assertEqual(Relationship.objects.all().count(), 1)


    def test_get_relationships(self):
        #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        u3 = User.objects.create_user(username=username3, password=password3)
        p1 = u1.person
        p2 = u2.person
        p3 = u3.person
        self.assertTrue(User.objects.all().count(), 3)
        self.assertTrue(Person.objects.all().count(), 3)
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)
        rel13 = p1.add_relationship(p3, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify retrieval of Relationship p1 following p2
        relQuery = p1.get_relationships(Relationship.RELATIONSHIP_FOLLOWING)
        self.assertEqual(len(relQuery), 2)
        #print(relQuery)
        self.assertEqual(relQuery[0].user.username, p2.user.username)
        self.assertEqual(relQuery[1].user.username, p3.user.username)

        relQuery1 = p2.get_relationships(Relationship.RELATIONSHIP_FOLLOWING)
        self.assertEqual(len(relQuery1), 0)
        relQuery2 = p3.get_relationships(Relationship.RELATIONSHIP_FOLLOWING)
        self.assertEqual(len(relQuery2), 0)

    def test_get_following(self):
        #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        u3 = User.objects.create_user(username=username3, password=password3)
        p1 = u1.person
        p2 = u2.person
        p3 = u3.person
        self.assertTrue(User.objects.all().count(), 3)
        self.assertTrue(Person.objects.all().count(), 3)
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)
        rel13 = p1.add_relationship(p3, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify retrieval of Relationship p1 following p2
        relQuery = p1.get_following()
        self.assertEqual(len(relQuery), 2)
        #print(relQuery)
        self.assertEqual(relQuery[0].user.username, p2.user.username)
        self.assertEqual(relQuery[1].user.username, p3.user.username)

        relQuery1 = p2.get_following()
        self.assertEqual(len(relQuery1), 0)
        relQuery2 = p3.get_following()
        self.assertEqual(len(relQuery2), 0)

    def test_get_related_to(self):
        #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        u3 = User.objects.create_user(username=username3, password=password3)
        p1 = u1.person
        p2 = u2.person
        p3 = u3.person
        self.assertTrue(User.objects.all().count(), 3)
        self.assertTrue(Person.objects.all().count(), 3)
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)
        rel13 = p1.add_relationship(p3, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify retrieval of Relationship on p2 where p1 following p2
        relQuery21 = p2.get_related_to(Relationship.RELATIONSHIP_FOLLOWING)
        relQuery31 = p3.get_related_to(Relationship.RELATIONSHIP_FOLLOWING)
        relQuery1_  = p1.get_related_to(Relationship.RELATIONSHIP_FOLLOWING)
        self.assertEqual(len(relQuery21), 1)
        self.assertEqual(len(relQuery31), 1)
        self.assertEqual(len(relQuery1_), 0)

        #Verify both p2, p3 have relationship with p1
        self.assertEqual(relQuery21[0].user.username, p1.user.username)
        self.assertEqual(relQuery31[0].user.username, p1.user.username)

    def test_get_followers(self):
        #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        u3 = User.objects.create_user(username=username3, password=password3)
        p1 = u1.person
        p2 = u2.person
        p3 = u3.person
        self.assertTrue(User.objects.all().count(), 3)
        self.assertTrue(Person.objects.all().count(), 3)
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)
        rel13 = p1.add_relationship(p3, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify retrieval of Relationship on p2 where p1 following p2
        relQuery21 = p2.get_followers()
        relQuery31 = p3.get_followers()
        relQuery1_  = p1.get_followers()
        self.assertEqual(len(relQuery21), 1)
        self.assertEqual(len(relQuery31), 1)
        self.assertEqual(len(relQuery1_), 0)

        #Verify both p2, p3 have relationship with p1
        self.assertEqual(relQuery21[0].user.username, p1.user.username)
        self.assertEqual(relQuery31[0].user.username, p1.user.username)


    def test_get_friends(self):
        #Create a pair of Users/People
        u1 = User.objects.create_user(username=username1, password=password1)
        u2 = User.objects.create_user(username=username2, password=password2)
        u3 = User.objects.create_user(username=username3, password=password3)
        p1 = u1.person
        p2 = u2.person
        p3 = u3.person
        self.assertTrue(User.objects.all().count(), 3)
        self.assertTrue(Person.objects.all().count(), 3)
        rel12 = p1.add_relationship(p2, Relationship.RELATIONSHIP_FOLLOWING)
        rel21 = p2.add_relationship(p1, Relationship.RELATIONSHIP_FOLLOWING)
        rel13 = p1.add_relationship(p3, Relationship.RELATIONSHIP_FOLLOWING)

        #Verify retrieval of symmetric Relationships
        relQuery12 = p1.get_friends()
        relQuery21 = p2.get_friends()
        relQuery31 = p3.get_friends()

        self.assertEqual(len(relQuery12), 1)
        self.assertEqual(len(relQuery21), 1)
        self.assertEqual(len(relQuery31), 0)

        #Verify p1 is friends with p2 and vice-versa
        self.assertEqual(relQuery12[0].user.username, p2.user.username)
        self.assertEqual(relQuery21[0].user.username, p1.user.username)


