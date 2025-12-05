
import html2canvas from 'html2canvas';

export const downloadChartAsJpg = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
      // Use html2canvas to capture the entire container (including legend, title, etc)
      const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff', // Ensure white background for JPG
          scale: 2, // Higher resolution
          logging: false
      });
      
      const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      const link = document.createElement('a');
      link.href = jpgUrl;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  } catch (error) {
      console.error("Failed to export chart:", error);
  }
};
