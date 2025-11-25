import Header from '../Header';

export default function HeaderExample() {
  return (
    <Header 
      onCartClick={() => console.log('Cart clicked')}
      onAIClick={() => console.log('AI assistant clicked')}
      onAuthClick={() => console.log('Auth clicked')}
      cartItemCount={3}
      user={null}
    />
  );
}
