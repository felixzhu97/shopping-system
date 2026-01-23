import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '../components/ui/card';

describe('Card Components', () => {
  it('should render Card component correctly', () => {
    render(
      <Card data-testid="card">
        <p>Card content</p>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Card content');
  });

  it('should apply custom className to Card', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <p>Content</p>
      </Card>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-card');
  });

  it('should render CardHeader correctly', () => {
    render(
      <Card>
        <CardHeader data-testid="card-header">
          <p>Header content</p>
        </CardHeader>
      </Card>
    );

    const header = screen.getByTestId('card-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveTextContent('Header content');
  });

  it('should render CardContent correctly', () => {
    render(
      <Card>
        <CardContent data-testid="card-content">
          <p>Main content</p>
        </CardContent>
      </Card>
    );

    const content = screen.getByTestId('card-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Main content');
  });

  it('should render CardFooter correctly', () => {
    render(
      <Card>
        <CardFooter data-testid="card-footer">
          <p>Footer content</p>
        </CardFooter>
      </Card>
    );

    const footer = screen.getByTestId('card-footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent('Footer content');
  });

  it('should render CardTitle correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle data-testid="card-title">Card Title</CardTitle>
        </CardHeader>
      </Card>
    );

    const title = screen.getByTestId('card-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Card Title');
  });

  it('should render CardDescription correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription data-testid="card-description">Card description text</CardDescription>
        </CardHeader>
      </Card>
    );

    const description = screen.getByTestId('card-description');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Card description text');
  });

  it('should render complete card structure', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Product Card</CardTitle>
          <CardDescription>A sample product description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Product details and information</p>
        </CardContent>
        <CardFooter>
          <button>Add to Cart</button>
        </CardFooter>
      </Card>
    );

    const card = screen.getByTestId('complete-card');
    expect(card).toBeInTheDocument();

    expect(screen.getByText('Product Card')).toBeInTheDocument();
    expect(screen.getByText('A sample product description')).toBeInTheDocument();
    expect(screen.getByText('Product details and information')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
  });

  it('should apply custom classes to all card components', () => {
    render(
      <Card className="custom-card" data-testid="card">
        <CardHeader className="custom-header" data-testid="header">
          <CardTitle className="custom-title" data-testid="title">
            Title
          </CardTitle>
          <CardDescription className="custom-desc" data-testid="desc">
            Description
          </CardDescription>
        </CardHeader>
        <CardContent className="custom-content" data-testid="content">
          Content
        </CardContent>
        <CardFooter className="custom-footer" data-testid="footer">
          Footer
        </CardFooter>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('custom-card');
    expect(screen.getByTestId('header')).toHaveClass('custom-header');
    expect(screen.getByTestId('title')).toHaveClass('custom-title');
    expect(screen.getByTestId('desc')).toHaveClass('custom-desc');
    expect(screen.getByTestId('content')).toHaveClass('custom-content');
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });
});
