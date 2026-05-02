require('dotenv').config();
const connectDB = require('./config/mongoose');
const { User, Product } = require('./models/mongoose');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Nettoyage complet
    await User.deleteMany();
    await Product.deleteMany();
    console.log('✅ Base de données nettoyée');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Création des Utilisateurs
    const users = await User.create([
      { name: 'Kouassi Jean', username: 'jean_k', email: 'jean@test.com', password: hashedPassword, role: 'user' },
      { name: 'Awa Traoré', username: 'awa_t', email: 'awa@test.com', password: hashedPassword, role: 'admin' },
      { name: 'Moussa Koné', username: 'moussa_k', email: 'moussa@test.com', password: hashedPassword, role: 'user' }
    ]);
    console.log('✅ Utilisateurs créés');

    // Création des Produits avec images WEB valides
    const products = await Product.create([
      {
        name: 'Attiéké Traditionnel',
        category: 'Alimentation',
        price: 1500,
        currency: 'XOF',
        stock: 100,
        shortDesc: 'Attiéké frais et authentique',
        description: 'Attiéké traditionnel ivoirien, préparé selon les méthodes ancestrales.',
        images: [{ url: 'https://th.bing.com/th/id/OIP.4iNV3Q2xjiDe5qfVOTTBgwHaEK?w=329&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', alt: 'Attiéké', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        origin: "Côte d'Ivoire"
      },
      {
        name: 'Pagne Wax Authentique',
        category: 'Vêtements',
        price: 8500,
        currency: 'XOF',
        stock: 50,
        shortDesc: 'Qualité supérieure',
        description: 'Pagne wax de haute qualité avec motifs africains traditionnels.',
        images: [{ url: 'https://th.bing.com/th/id/OIP.RfB9njsO8aOUgBrd5Kq6kQHaJ1?w=208&h=277&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', alt: 'Pagne Wax', isPrimary: true }],
        isActive: true,
        isFeatured: true,
        origin: "Côte d'Ivoire"
      },
      {
        name: 'Beurre de Karité Bio',
        category: 'Beauté',
        price: 3000,
        currency: 'XOF',
        stock: 80,
        shortDesc: 'Beurre de karité pur et naturel',
        description: 'Beurre de karité 100% naturel, pressé à froid. Idéal pour la peau et les cheveux.',
        images: [{ url: 'https://haut-segala.com/wp-content/uploads/2022/06/karite2.jpg', alt: 'Beurre de Karité', isPrimary: true }],
        isActive: true,
        isNew: true,
        origin: "Côte d'Ivoire"
      },
      {
        name: 'Café Robusta Premium',
        category: 'Boissons',
        price: 4500,
        currency: 'XOF',
        stock: 60,
        shortDesc: 'Café robusta torréfié',
        description: 'Café robusta de Côte d\'Ivoire, torréfié artisanalement.',
        images: [{ url: 'https://th.bing.com/th/id/OIP.J27sdpQxVx4Ack0lNEYqrgHaHa?w=219&h=219&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', alt: 'Café', isPrimary: true }],
        isActive: true,
        origin: "Côte d'Ivoire"
      }
    ]);
    console.log('✅ Produits créés');

    // Avis test
    products[0].reviews.push({
      userId: users[1]._id,
      rating: 5,
      comment: 'Excellent produit !'
    });
    await products[0].save();

    console.log('🎉 Données insérées avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du seeding :', err);
    process.exit(1);
  }
};

seedDatabase();
