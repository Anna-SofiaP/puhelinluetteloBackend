require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
morgan.token('data', (req, res) => {return JSON.stringify(req.body)})

let persons = [
]

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
    res.json(persons)
    })
  })

app.get('/', (req, res) => {
    res.send('<h1>Phonebook</h1>')
})

/*app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(per => per.id === id)
    
  
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
})*/

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
      .then(person => {
        if (person) {
          res.json(person)
        } else {
          res.status(404).end()
        }
      })
      .catch(error => next(error))
})

app.get('/info', (req, res) => {
    let numberOfPersons = 0
    const date = new Date()

    Person.find({}).then(persons => {
      numberOfPersons = persons.length
      res.send(`<div><p>Phonebook contains information for ${numberOfPersons} people.</p><p>${date.toString()}</p></div>`)
    })
})

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => {
      next(error)
      /*console.log(error)
      res.status(500).end()*/
    })
})

/*const generateId = () => {
    const newId = Math.floor(Math.random() * 100)
    return newId
}*/

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Information is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
})


app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})


const errorHandling = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'There is no object with such id.' })
  }

  next(error)
}

app.use(errorHandling)

/*app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({ 
          error: 'Information is missing'
        })
    }

    const hasSameName = persons.find(person => body.name === person.name)
    if (hasSameName) {
        return res.status(400).json({
            error: 'Name must be unique'
        })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    res.json(person)
})*/

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})