import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const NotFoundPage = () => (
  <div className="mx-auto max-w-xl">
    <Card className="p-8 text-center">
      <h1 className="text-3xl font-extrabold text-zinc-950 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        The route you opened does not exist in the NewsGuard frontend.
      </p>
      <Button as={Link} to="/" icon={Home} className="mt-5">
        Back to feed
      </Button>
    </Card>
  </div>
);

export default NotFoundPage;
