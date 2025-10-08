# Phase 1

This is to be a single page application, with 3 layouts: Project View and Knowledge Base View and Task View

For now, we skip auth and login pages, and just create a test user in the database, and associate all data with this test user. This is just for prototyping purposes.

Throughout this implementation, make all the visual designs sleek and modern, with subtle gradients. Make sure to appropriately give elements smooth animations when it make sense to. Set these color variables and use them always

--bg-dark: oklch(0.1 0.03 310);
--bg: oklch(0.15 0.03 310);
--bg-light: oklch(0.2 0.03 310);
--text: oklch(0.96 0.06 310);
--text-muted: oklch(0.76 0.06 310);
--highlight: oklch(0.5 0.06 310);
--border: oklch(0.4 0.06 310);
--border-muted: oklch(0.3 0.06 310);
--primary: oklch(0.76 0.1 310);
--secondary: oklch(0.76 0.1 130);
--danger: oklch(0.7 0.06 30);
--warning: oklch(0.7 0.06 100);
--success: oklch(0.7 0.06 160);
--info: oklch(0.7 0.06 260);

## Project View

If there is no project, the page should be blank, and a centered large text should say 'Create Your First Project'

There should be a + button in the top right corner with round edges. This is the add Project Button

Creating a new project will open a Modal that will allow the user to input information for the project. Refer to the data model to know what columns to include and what columns are required. There should be a create and cancel button at the bottom.

Projects are listed on the project view as list with the Project name, it's status, it's time estimate, and two buttons at the end. The buttons at the end are and editing button for opening the project editing modal (which should be very similear to the create project modal) and the expand/collapse button, which will reveal the goals associated to this project.

When the expand button is pressed, it should reveal the goals underneath it with a small indentation to clarify the heirarchical relationship between projects and goals. The end of the goals list should always be an "add new goals" button. This means even if there's no goals for a project, pressing the expand button should at least reveal the 'add new goals' row of the list.

Goals will need similar things. The add new goals buttons should reveal a modal to create a goal. Reference the database to know what fields should be enterable here, what fields need to be required. Note: if the user chooses the make a weekly-milestone, they MUST pick a parent monthly/quarterly goal for it. The list elements themselves are similar to projects. If it's a weekly-milestone, it should always be listed under it's parent monthly/quarterly goal in a slightly different shade, before the next monthly goal/quarterly goal. each list element should show the name, the state, the time frame, and then the final 2 buttons again. Every goal will have the edit button, but for montly/quarterly goals, the second button is a + sign that lets you create a weekly-milestone linked to that goal(this means open up a creation modal), while for the weekly-milestone, they will insetad have the expand/colapse button. This time, the expanding button reveals tasks related to the weekly-milestone, and in a similar fashion is ended by a "add new tasks" list element, which upon click will open up the 'create task' modal. 

Finally the tasks cannot be furter expanded on. The tasks should have the name, the status, the time estimate, and have a couple buttons at the end. They should always have the edit button to open the task editing modal, but depending on their current status, there should be a button to easily update status. If 'Not Started' there should be one button to make it active. If 'Active', there should be 3 buttons (one to make 'not started', one to make it 'completed' and one to make it 'canceled'). If 'Completed' or 'Canceled' you should have a button to be able to make it 'Active' again.

This is the main way for the user to directly interact with the data in the postgresql database and be able to view everything tied to their account.

## Knowledge Base View

This is where the user can manage the Knowledge base documents. For this prototype, the user will only be able to create, view, and update knowledge documents (delete will be created later, but it should be rarely done, so we omit it for now).

Simliar to the add project button, there is an add document button in the same corner in this screen

The knowledge base view will be a gallery view with cards. Each card will show the knowledge document's name, an icon indicating there is an attachment. The day last updated. And then the content turncated since the card can't take up too much room. They will also show the project it's related to.

And finally a read and edit button at the bottom of each card. Both buttons open the same modal, but the modal will have 2 states: Read state and edit state. When the modal is open, there will be a button in the top right allows the user to switch between edit and read mode. When in read mode, .md gets rendered correctly, and none of the data can be edited in this state. When in edit mode, content can be edited, and markdown will appear as raw text instead.

## Tasks View

This view does not allow the user to update goals or projects. 

The purpose of this view is to have a lower level view of your project journey, and give you quick access to update your tasks, promoting an organized yet flexible workflow.

This view has two sub-views: Checklist and Kanban.

The checklist view has the list of all the tasks tied to the current active project. This view has the tasks listed out with the task name, the status, the project it's tied to, it's time estimate, and a series of buttons. Use the same logic for the buttons as in the project view. This should make it convinent for the user to update the status of their tasks.

Then there should be 3 radio buttons above the list (require select one) that picks show all tasks in active projects, show only in active goals, or show only in active weekly-milestone.

There should also be a sort button that lets you sort by dependency order, or sort by status (which really means order the tasks by active, then not started, then completed, then canceld, and within those groups, sorted by most recent first).

The Kanban view is a standard kanban view. (I haven't fully elaborated this, so just make what is 'default' kanban view, and I'll suggest updates after if need be)


## Navigations

The naviagtion will be a drawer on the left. The order will be - Projects
- Knowledge Base
- Tasks

Make the nav bar hideable