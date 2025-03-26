db = db.getSiblingDB('admin')

db.createUser({
  user: 'admin',
  pwd: 'secure_password_here',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' }
  ]
})

db = db.getSiblingDB('employee_pulse')

db.createUser({
  user: 'admin',
  pwd: 'secure_password_here',
  roles: [
    { role: 'readWrite', db: 'employee_pulse' }
  ]
}) 