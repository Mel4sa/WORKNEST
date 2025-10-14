// Curl komutu ile test etmek için
// Backend terminalde çalıştırın:

// 1. Önce alınan davetleri listeleyin:
// curl -X GET http://localhost:3000/api/invites/received \
//   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
//   -H "Content-Type: application/json"

// 2. Davet yanıtlayın:
// curl -X PATCH http://localhost:3000/api/invites/respond/INVITE_ID \
//   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
//   -H "Content-Type: application/json" \
//   -d '{"action":"accepted"}'

console.log("Test için bu komutları backend terminalden çalıştırın");
