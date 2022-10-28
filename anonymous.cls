/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 10-28-2022
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
Id accountId = '{$recordId$}'; // {$recordId$} will be replaced by actual Account Id from CSV File.
List<Contact> contacts = new List<Contact>();
ContactTriggerHandler.updateContactInWorkDay([Select id,Name from Contact where AccountId = :accountId]);