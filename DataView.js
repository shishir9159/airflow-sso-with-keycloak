// This is the Mermaid configuration
// gantt
// dataviewjs

// To leverage the available time format in the chart using "moment", we need file creation time in minutes format
let creationTimeinMinutes = dv.current().file.ctime.c.hour * 60 + dv.current().file.ctime.c.minute

const creationTime = moment.utc().startOf('day').add(creationTimeinMinutes, 'minutes').format('HH:mm')

const creationDate = dv.current().file.ctime.c.day + "-" + dv.current().file.ctime.c.month + "-" + dv.current().file.ctime.c.year

function timeValidation(task) {
	return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(task);  
}

function stripTitleFromLinks(taskAssociatedNoteLinks) {

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

function taskParser(flag, task, taskSection) {

	var tasks = "section " + task + "\n";
	for (let i = 0; i < taskSection.length; i++) {

		if (!taskSection[i].text.length)
			continue

		let startingTime = taskSection[i].text.slice(0, 5)
		let finishingTime = taskSection[i].text.slice(8, 13)

		let taskDescription, timeBudget;

		if (timeValidation(startingTime) && timeValidation(finishingTime)) {
			taskDescription = taskSection[i].text.substring(14)
			timeBudget = timeLimit(startingTime, finishingTime) + "m"
		} else {
			startingTime = creationTime
			timeBudget = defaultTimeBudget
			taskDescription = taskSection[i].text
		}

		taskDescription = taskDescription.split(':')[0]

		if (taskDescription.indexOf('|') != -1)
			taskDescription = stripTitleFromLinks(taskDescription)

		tasks = tasks + taskDescription + flag + creationDate + ", " + startingTime + " , " + timeBudget + "\n"
	}

	return tasks
}

const sectionName = ["Urgent", "Overdue", "Ongoing Project", "Reading", "To-Do", "Chore", "Habit", "Lyre"]

const taskMap = new Map();

const taskFlag = new Map([
	["Urgent", " : crit, active, "],
	["Overdue", " : "],
	["Ongoing Project", " : "],
	["Reading", " : "],
	["To-Do", " : active, "],
	["Chore", " : "],
	["Habit", " : "],
	["Lyre", " : "],
  ]);

const taskCompletedFlag = new Map([
	["Urgent", " : crit, done, "],
	["Overdue", " : done, "],
	["Ongoing Project", " : done, "],
	["Reading", " : done, "],
	["To-Do", " : active, done, "],
	["Chore", " : done, "],
	["Habit", " : done, "],
	["Lyre", " : done, "],
  ]);

for (let i = 0; i < sectionName.length; i++) {

	const taskSection = dv.current().file.tasks.where(t => !t.completed).filter(task => task.header.subpath == sectionName[i])
	const taskCompleted = dv.current().file.tasks.where(t => t.completed).filter(task => task.header.subpath == sectionName[i])

	const tasks = taskParser(taskFlag.get(sectionName[i]), sectionName[i], taskSection)
	tasks += taskParser(taskCompletedFlag.get(sectionName[i]), sectionName[i], taskCompleted)

	taskMap.set(sectionName[i], tasks)
}

const backticks = "```"

dv.paragraph(
`${backticks}${mermaidConf}
${taskMap.get("Urgent")}
${taskMap.get("Overdue")}
${taskMap.get("Ongoing Project")}
${taskMap.get("Reading")}
${taskMap.get("To-Do")}
${taskMap.get("Chore")}
${taskMap.get("Habit")}
${taskMap.get("Lyre")}
`,)