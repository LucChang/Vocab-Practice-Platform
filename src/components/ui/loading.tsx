import { LoadingOverlay, Box } from '@mantine/core';

export function Loading() {
  return (
    <Box pos="relative" h="100vh">
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'pink', type: 'bars' }}
      />
    </Box>
  );
}