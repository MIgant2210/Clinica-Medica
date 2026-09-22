import bcrypt from 'bcryptjs';

async function test() {
  const isMatch = await bcrypt.compare('admin123', '$2a$10$wN9iL6b1/vA4/a4hYw0n1OMx3v7vW1I5zR1cT/x.gYwM6P1Z3F.kS');
  console.log('admin123 matches:', isMatch);
}

test();
