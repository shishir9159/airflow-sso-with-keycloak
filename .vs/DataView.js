let creationTimeinMinutes = dv.current().file.ctime.c.hour * 60 + dv.current().file.ctime.c.minute

const creationTime = moment.utc().startOf('day').add(creationTimeinMinutes, 'minutes').format('HH:mm')

const creationDate = dv.current().file.ctime.c.day + "-" + dv.current().file.ctime.c.month + "-" + dv.current().file.ctime.c.year

function timeValidation(task) {
	return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(task);  
}

function stripTitleFromLinks(taskAssociatedNoteLinks) {

	let flag = 0
	let title = ""
	for (let i=0; i < taskAssociatedNoteLinks.length-1; i++) {
		if (taskAssociatedNoteLinks[i] == '[' && taskAssociatedNoteLinks[i+1] == '[') {
			while (taskAssociatedNoteLinks[++i] != '|');
		}
		else if (taskAssociatedNoteLinks[i] == ']' && taskAssociatedNoteLinks[i+1] == ']')
			i = i + 2
		else
			title = title + taskAssociatedNoteLinks[i]
	}

	return title
}

function timeLimit(startingTime, finishingTime) {
	const s = startingTime.split(":");
	const f = finishingTime.split(":");

	return (Number(f[0]) - Number(s[0])) * 60 + (Number(f[1]) - Number(s[1]))
}

const defaultTimeBudget = "30m"

const urgent = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Urgent")

const urgentCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Urgent")

const overdue = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Overdue")

const overdueCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Overdue")

const ongoingProject = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Ongoing Project")

const ongoingProjectCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Ongoing Project")

const reading = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Reading")

const readingCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Reading")

const todo = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "To-Do")

const todoCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "To-Do")

const chore = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Chore")

const choreCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Chore")

const habit = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Habit")

const habitCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Habit")

const lyre = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == "Lyre")

const lyreCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == "Lyre")

// This is the Mermaid configuration.
const mermaidConf = `mermaid
gantt
    title Daily Tasks Diagram
    dateFormat HH:mm
    axisFormat %H:%M
    tickInterval 2h
    todayMarker off
`
// Initial milestone

var urgentTasks = "section Urgent\n";
for (let i = 0; i < urgent.length; i++) {

	if (!urgent[i].text.length)
		continue

	let startingTime = urgent[i].text.slice(0, 5)
	let finishingTime = urgent[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = urgent[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = urgent[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	urgentTasks = urgentTasks + taskDescription + " : crit, active, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < urgentCompleted.length; i++) {

	if (!urgentCompleted[i].text.length)
		continue

	let startingTime = urgentCompleted[i].text.slice(0, 5)
	let finishingTime = urgentCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = urgentCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = urgentCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	urgentTasks = urgentTasks + taskDescription + " : crit, done, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var overdueTasks = "section Overdue\n";
for (let i = 0; i < overdue.length; i++) {

	if (!overdue[i].text.length)
		continue

	let startingTime = overdue[i].text.slice(0, 5)
	let finishingTime = overdue[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = overdue[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = overdue[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	overdueTasks = overdueTasks + taskDescription + " : " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < overdueCompleted.length; i++) {

	if (!overdueCompleted[i].text.length)
		continue

	let startingTime = overdueCompleted[i].text.slice(0, 5)
	let finishingTime = overdueCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = overdueCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = overdueCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	overdueTasks = overdueTasks + taskDescription + " : done, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var ongoingProjectTasks = "section Ongoing Project\n";
for (let i = 0; i < ongoingProject.length; i++) {

	if (!ongoingProject[i].text.length)
		continue

	let startingTime = ongoingProject[i].text.slice(0, 5)
	let finishingTime = ongoingProject[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = ongoingProject[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = ongoingProject[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	ongoingProjectTasks = ongoingProjectTasks + taskDescription + " : "  + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < ongoingProjectCompleted.length; i++) {

	if (!ongoingProjectCompleted[i].text.length)
		continue

	let startingTime = ongoingProjectCompleted[i].text.slice(0, 5)
	let finishingTime = ongoingProjectCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = ongoingProject[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = ongoingProjectCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	ongoingProjectTasks = ongoingProjectTasks + taskDescription + " : done, "  + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var readingTasks = "section Reading\n";
for (let i = 0; i < reading.length; i++) {

	if (!reading[i].text.length)
		continue

	let startingTime = reading[i].text.slice(0, 5)
	let finishingTime = reading[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = reading[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = reading[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	readingTasks = readingTasks + taskDescription + " : "  + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < readingCompleted.length; i++) {

	if (!readingCompleted[i].text.length)
		continue

	let startingTime = readingCompleted[i].text.slice(0, 5)
	let finishingTime = readingCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = readingCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = readingCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	readingTasks = readingTasks + taskDescription + " : done, "  + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var todoTasks = "section To-Do\n";
for (let i = 0; i < todo.length; i++) {

	if (!todo[i].text.length)
		continue

	let startingTime = todo[i].text.slice(0, 5)
	let finishingTime = todo[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = todo[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = todo[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	todoTasks = todoTasks + taskDescription + " : active, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < todoCompleted.length; i++) {

	if (!todoCompleted[i].text.length)
		continue

	let startingTime = todoCompleted[i].text.slice(0, 5)
	let finishingTime = todoCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = todoCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = todoCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	todoTasks = todoTasks + taskDescription + " : active, done, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var choreTasks = "section Chore\n";
for (let i = 0; i < chore.length; i++) {

	if (!chore[i].text.length)
		continue

	let startingTime = chore[i].text.slice(0, 5)
	let finishingTime = chore[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = chore[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = chore[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	choreTasks = choreTasks + taskDescription + " : " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < choreCompleted.length; i++) {

	if (!choreCompleted[i].text.length)
		continue

	let startingTime = choreCompleted[i].text.slice(0, 5)
	let finishingTime = choreCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = choreCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = choreCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	choreTasks = choreTasks + taskDescription + " : done, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var habitTasks = "section Habit\n";
for (let i = 0; i < habit.length; i++) {

	if (!habit[i].text.length)
		continue

	let startingTime = habit[i].text.slice(0, 5)
	let finishingTime = habit[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = habit[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = habit[i].text
	}

	taskDescription = taskDescription.split(':')[0]

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	habitTasks = habitTasks + taskDescription + " : " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < habitCompleted.length; i++) {

	if (!habitCompleted[i].text.length)
		continue

	let startingTime = habitCompleted[i].text.slice(0, 5)
	let finishingTime = habitCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = habitCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = habitCompleted[i].text
	}

	taskDescription = taskDescription.split(':')[0]

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	habitTasks = habitTasks + taskDescription + " : done, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

var lyreTasks = "section Lyre\n";
for (let i = 0; i < lyre.length; i++) {

	if (!lyre[i].text.length)
		continue

	let startingTime = lyre[i].text.slice(0, 5)
	let finishingTime = lyre[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = lyre[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = lyre[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	lyreTasks = lyreTasks + taskDescription + " : " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

for (let i = 0; i < lyreCompleted.length; i++) {

	if (!lyreCompleted[i].text.length)
		continue

	let startingTime = lyreCompleted[i].text.slice(0, 5)
	let finishingTime = lyreCompleted[i].text.slice(8, 13)

	let taskDescription, timeBudget;

	if (timeValidation(startingTime) && timeValidation(finishingTime)) {
		taskDescription = lyreCompleted[i].text.substring(14)
		timeBudget = timeLimit(startingTime, finishingTime) + "m"
	} else {
		startingTime = creationTime
		timeBudget = defaultTimeBudget
		taskDescription = lyreCompleted[i].text
	}

	if (taskDescription.indexOf('|') != -1)
		taskDescription = stripTitleFromLinks(taskDescription)

	lyreTasks = lyreTasks + taskDescription + " : done, " + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
}

const backticks = "```"

dv.paragraph(
`${backticks}${mermaidConf}
${urgentTasks}
${overdueTasks}
${ongoingProjectTasks}
${readingTasks}
${todoTasks}
${choreTasks}
${habitTasks}
${lyreTasks}
${backticks}`,)