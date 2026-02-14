import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BannerCanvas from '../../features/editor/components/BannerCanvas';
import { EditorProvider } from '../../features/editor/context/EditorContext';

// Mock the context if needed, or wrap in Provider
const renderWithContext = (component) => {
  return render(
    <EditorProvider>
      {component}
    </EditorProvider>
  );
};

describe('BannerCanvas', () => {
  it('renders correctly with default values', () => {
    renderWithContext(<BannerCanvas canvasRef={{ current: null }} />);
    // Check for default text from context
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('Your Role')).toBeInTheDocument();
  });
});
