const API = 'http://localhost:8000'

describe('API CRUD Routes', () => {
  // Nettoyer les utilisateurs créés pendant les tests
  let createdUserIds = []

  afterEach(() => {
    createdUserIds.forEach(id => {
      cy.request({ method: 'DELETE', url: `${API}/users/${id}`, failOnStatusCode: false })
    })
    createdUserIds = []
  })

  describe('GET /users', () => {
    it('should return the list of users', () => {
      cy.request('GET', `${API}/users`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('utilisateurs')
        expect(response.body.utilisateurs).to.be.an('array')
      })
    })
  })

  describe('GET /users/:id', () => {
    it('should return a single user by id', () => {
      // Créer un utilisateur d'abord
      cy.request('POST', `${API}/users`, { name: 'TestGet', email: 'testget@test.com' }).then(res => {
        const id = res.body.utilisateur.id
        createdUserIds.push(id)

        cy.request('GET', `${API}/users/${id}`).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.utilisateur).to.be.an('array')
          expect(response.body.utilisateur[1]).to.eq('TestGet')
          expect(response.body.utilisateur[2]).to.eq('testget@test.com')
        })
      })
    })

    it('should return 404 for non-existent user', () => {
      cy.request({ method: 'GET', url: `${API}/users/99999`, failOnStatusCode: false }).then(response => {
        expect(response.status).to.eq(404)
        expect(response.body.detail).to.eq('User not found')
      })
    })
  })

  describe('POST /users', () => {
    it('should create a new user', () => {
      cy.request('POST', `${API}/users`, { name: 'TestPost', email: 'testpost@test.com' }).then(response => {
        expect(response.status).to.eq(201)
        expect(response.body.utilisateur).to.have.property('id')
        expect(response.body.utilisateur.name).to.eq('TestPost')
        expect(response.body.utilisateur.email).to.eq('testpost@test.com')
        createdUserIds.push(response.body.utilisateur.id)
      })
    })

    it('should appear in the users list after creation', () => {
      cy.request('POST', `${API}/users`, { name: 'TestList', email: 'testlist@test.com' }).then(res => {
        createdUserIds.push(res.body.utilisateur.id)

        cy.request('GET', `${API}/users`).then(response => {
          const emails = response.body.utilisateurs.map(u => u[2])
          expect(emails).to.include('testlist@test.com')
        })
      })
    })
  })

  describe('PUT /users/:id', () => {
    it('should replace a user completely', () => {
      cy.request('POST', `${API}/users`, { name: 'OldName', email: 'old@test.com' }).then(res => {
        const id = res.body.utilisateur.id
        createdUserIds.push(id)

        cy.request('PUT', `${API}/users/${id}`, { name: 'NewName', email: 'new@test.com' }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.utilisateur.name).to.eq('NewName')
          expect(response.body.utilisateur.email).to.eq('new@test.com')
        })
      })
    })

    it('should return 404 for non-existent user', () => {
      cy.request({
        method: 'PUT',
        url: `${API}/users/99999`,
        body: { name: 'Ghost', email: 'ghost@test.com' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
      })
    })
  })

  describe('PATCH /users/:id', () => {
    it('should partially update a user (name only)', () => {
      cy.request('POST', `${API}/users`, { name: 'PatchMe', email: 'patch@test.com' }).then(res => {
        const id = res.body.utilisateur.id
        createdUserIds.push(id)

        cy.request('PATCH', `${API}/users/${id}`, { name: 'Patched' }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.utilisateur.name).to.eq('Patched')
          expect(response.body.utilisateur.email).to.eq('patch@test.com')
        })
      })
    })

    it('should partially update a user (email only)', () => {
      cy.request('POST', `${API}/users`, { name: 'PatchEmail', email: 'patchemail@test.com' }).then(res => {
        const id = res.body.utilisateur.id
        createdUserIds.push(id)

        cy.request('PATCH', `${API}/users/${id}`, { email: 'patched@test.com' }).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.utilisateur.name).to.eq('PatchEmail')
          expect(response.body.utilisateur.email).to.eq('patched@test.com')
        })
      })
    })

    it('should return 404 for non-existent user', () => {
      cy.request({
        method: 'PATCH',
        url: `${API}/users/99999`,
        body: { name: 'Ghost' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(404)
      })
    })
  })

  describe('DELETE /users/:id', () => {
    it('should delete an existing user', () => {
      cy.request('POST', `${API}/users`, { name: 'DeleteMe', email: 'deleteme@test.com' }).then(res => {
        const id = res.body.utilisateur.id

        cy.request('DELETE', `${API}/users/${id}`).then(response => {
          expect(response.status).to.eq(200)
          expect(response.body.message).to.eq('User deleted')
        })

        // Vérifier qu'il n'existe plus
        cy.request({ method: 'GET', url: `${API}/users/${id}`, failOnStatusCode: false }).then(response => {
          expect(response.status).to.eq(404)
        })
      })
    })

    it('should return 404 for non-existent user', () => {
      cy.request({ method: 'DELETE', url: `${API}/users/99999`, failOnStatusCode: false }).then(response => {
        expect(response.status).to.eq(404)
      })
    })
  })
})
