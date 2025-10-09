# develop with react + shadcn + tailwindcss v4 + vite.md

Instruction on how to develop a website for the user using react + shadcn + tailwindcss v4 + vite 

## Steps

1. You will always begin a workflow by using context7 to read to look up the shadcn documentation, and the Tailwindcss v4 documentation (IMPORTANT: v4 and v3 work differently, so make sure you are referencing v4)
2. When creating components, you will always levarage the shadcn cli to be creating the ui component
3. If you are unsure which component to use for an implementation, come up with possible solutions and present it to the user so that they can make an informed decision. Take their decision and implement the compontent
4. Upon first implementing a component that requires data, you should mock the data using a json that you would expect the backend to return. The json should mock all the field's that would need to be read for the component.
5. API calls to the backend should be abstracted to a service layer and put in a folder called 'service/' in the 'frontend/' dir. They should be .ts file and not include any TSX/JSX.
6. Each time you implement a new compontent in what you believe is a 'functional state', run a 'npx tsc -b' command in the frontend folder to catch typescript mistakes early
7. Debug and resolve any errors caught in step 6. Repeat step 6 - 7 until you've resolved the typescript issues
8. Repeat steps 2 - 7 until you've created the application to the user's specifications.