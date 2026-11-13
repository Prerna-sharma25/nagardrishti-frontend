**1. File: src/controllers/fieldController.js**

Function: getMyTasks

Change: status array mein 'closed' add karna hai.



javascript

// Is line ko:

status: { $in: \['assigned', 'in\_progress', 'resolved'] }



// Is line se replace karein:

status: { $in: \['assigned', 'in\_progress', 'resolved', 'closed'] }





**2. File: src/controllers/adminController.js**

**Function: getDeptComplaints**

Change: filter.status array mein 'closed' add karna hai.



javascript

**// Is line ko:**

filter.status = { $in: \['verified', 'assigned', 'in\_progress', 'resolved'] }



**// Is line se replace karein:**

filter.status = { $in: \['verified', 'assigned', 'in\_progress', 'resolved', 'closed'] }



**3.File: src/controllers/complaintController.js**



**Function: getComplaints**



Change: Complaint fetch karte waqt assignedTo field ko .populate() karna hai, taaki worker ki ID ke sath uska naam bhi aa sake.



javascript

**// Pehle:**

const complaints = await Complaint.find(filter)

&#x20; .sort({ reportedAt: -1 })

&#x20; .skip(skip)

&#x20; .limit(parseInt(limit));



**// Baad mein (yeh update karein):**

const complaints = await Complaint.find(filter)

&#x20; .populate('assignedTo', 'name zone') // 👈 Yeh line add karni hai

&#x20; .sort({ reportedAt: -1 })

&#x20; .skip(skip)

&#x20; .limit(parseInt(limit));







