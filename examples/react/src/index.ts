import somnolence from '@somnolence/client'

somnolence.__root().then(response => console.log(response))

somnolence
  .helloGET({ query: { name: 'world' } })
  .then(response => console.log(response))

somnolence.authorized().then(response => console.log(response))
